import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'
import { getFedaPayConfig } from '@/lib/fedapay'

const VALID_SUBSCRIPTION_PLANS = ['STARTER', 'BUSINESS', 'PRO'] as const
type SubscriptionPlan = (typeof VALID_SUBSCRIPTION_PLANS)[number]
const isValidSubscriptionPlan = (value: string): value is SubscriptionPlan =>
  (VALID_SUBSCRIPTION_PLANS as readonly string[]).includes(value)

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-fedapay-signature')
    const fedapayConfig = await getFedaPayConfig()
    const secret = fedapayConfig.webhookSecret

    if (!secret || !signature) {
      console.error('Missing secret or signature')
      return NextResponse.json({ error: 'Missing secret or signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    const sigBuffer = Buffer.from(signature, 'utf8')
    const expectedSigBuffer = Buffer.from(expectedSignature, 'utf8')

    if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      console.error('Invalid FedaPay signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const body = JSON.parse(rawBody)
    const { name, entity } = body

    if (typeof name === 'string' && name.startsWith('payout.')) {
      const providerId = entity?.id ? String(entity.id) : null
      const metadata = entity?.custom_metadata || entity?.metadata || {}
      const withdrawalId = typeof metadata.withdrawal_id === 'string' ? metadata.withdrawal_id : null
      const providerStatus = String(entity?.status ?? '').toLowerCase()
      const status = name === 'payout.sent' || providerStatus === 'sent'
        ? 'PAID'
        : name === 'payout.failed' || providerStatus === 'failed'
          ? 'FAILED'
          : 'PROCESSING'

      if (providerId || withdrawalId) {
        await prisma.withdrawal.updateMany({
          where: {
            status: 'PROCESSING',
            ...(withdrawalId ? { id: withdrawalId } : { provider_id: providerId! }),
          },
          data: { status, processed_at: new Date() },
        })
      }
      return NextResponse.json({ received: true }, { status: 200 })
    }

    // On traite uniquement les événements liés aux transactions
    if (name === 'transaction.approved' || name === 'transaction.canceled' || name === 'transaction.failed') {
      const transactionId = String(entity.id)
      const metadata = entity.custom_metadata || entity.metadata || {}

      if (metadata.type === 'subscription') {
        if (name === 'transaction.approved') {
          const sellerId = metadata.seller_id
          const rawPlan = String(metadata.plan ?? '')

          if (!isValidSubscriptionPlan(rawPlan)) {
            console.error(`Plan d'abonnement invalide reçu du webhook: ${rawPlan}`)
            return NextResponse.json({ received: true }, { status: 200 })
          }
          const plan: SubscriptionPlan = rawPlan
          const amount = entity.amount

          const expectedAmount = plan === 'STARTER' ? 500 : plan === 'BUSINESS' ? 1000 : 0
          if (expectedAmount > 0 && amount !== expectedAmount) {
            console.error(`Montant invalide pour le plan ${plan}: attendu ${expectedAmount}, reçu ${amount}`)
            return NextResponse.json({ received: true }, { status: 200 })
          }

          try {
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
            
            if (seller) {
              await prisma.$transaction([
                prisma.processedWebhook.create({
                  data: { transaction_id: transactionId }
                }),
                prisma.seller.update({
                  where: { id: sellerId },
                  data: {
                    subscription_plan: plan,
                    subscription_expires_at: expiresAt,
                  }
                }),
                prisma.adminLog.create({
                  data: {
                    action: 'subscription_activated',
                    resource_type: 'seller',
                    resource_id: sellerId,
                    changes: { plan, transaction_id: transactionId, expires_at: expiresAt.toISOString() },
                  }
                }),
                prisma.notification.create({
                  data: {
                    user_id: seller.user_id,
                    type: 'subscription',
                    title: 'Abonnement activé',
                    message: `Votre abonnement au plan ${plan} a été activé avec succès.`,
                  }
                })
              ])
            }
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
              console.log(`Webhook d'abonnement déjà traité pour la transaction: ${transactionId}`)
              return NextResponse.json({ received: true }, { status: 200 })
            }
            throw e
          }
        }
        return NextResponse.json({ received: true }, { status: 200 })
      }

      const payment = await prisma.payment.findUnique({
        where: { transaction_id: transactionId },
        include: { splits: true },
      })

      if (!payment) {
        console.error(`Payment not found for FedaPay transaction: ${transactionId}`)
        return NextResponse.json({ received: true }, { status: 200 })
      }

      if (name === 'transaction.approved') {
        // Charge les articles de la commande pour décrémenter le stock des
        // produits suivis (stock_mode = TRACKED). Fait ici plutôt qu'au
        // moment du checkout : le stock ne doit bouger qu'une fois le
        // paiement réellement confirmé par FedaPay, jamais avant.
        const captured = await prisma.$transaction(async (tx) => {
          // Atomically claim the payment so concurrent approved webhooks can
          // never decrement stock or create financial effects twice.
          const claim = await tx.payment.updateMany({
            where: { id: payment.id, status: { in: ['PENDING', 'AUTHORIZED'] } },
            data: { status: 'CAPTURED', paid_at: new Date() },
          })
          if (claim.count === 0) return false

          const orderItems = await tx.orderItem.findMany({
            where: { order_id: payment.order_id },
            select: {
              product_id: true,
              quantity: true,
              product: { select: { stock_mode: true } },
            },
          })

          await tx.order.update({
            where: { id: payment.order_id },
            data: { status: 'COMPLETED' },
          })
          await tx.commissionEntry.createMany({
            data: payment.splits.map((split) => ({
              payment_id: payment.id,
              payment_split_id: split.id,
              shop_id: split.shop_id,
              platform_fee: split.platform_fee,
              seller_earning: split.seller_earning,
              status: 'AVAILABLE' as const,
            })),
            skipDuplicates: true,
          })

          for (const item of orderItems) {
            if (item.product.stock_mode !== 'TRACKED') continue
            // Never decrement below zero, even if another checkout raced us.
            await tx.product.updateMany({
              where: { id: item.product_id, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            })
          }
          return true
        })

        if (!captured) {
          return NextResponse.json({ received: true }, { status: 200 })
        }
      } else {
        // transaction.canceled ou transaction.failed
        await prisma.$transaction(async (tx) => {
          const claim = await tx.payment.updateMany({
            where: { id: payment.id, status: { in: ['PENDING', 'AUTHORIZED'] } },
            data: { status: 'FAILED' },
          })
          if (claim.count > 0) {
            await tx.order.update({
              where: { id: payment.order_id },
              data: { status: 'CANCELLED' },
            })
          }
        })
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    // Retourne toujours un statut 200 en cas d'erreur de traitement interne
    console.error('FedaPay webhook internal error:', err)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const id = url.searchParams.get('id')

    console.log(`Received redirect from FedaPay (browser): status=${status}, id=${id}`)

    let redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'}/payment/result?status=${encodeURIComponent(String(status ?? ''))}&id=${encodeURIComponent(String(id ?? ''))}`

    if (id) {
      try {
        const fedapayConfig = await getFedaPayConfig()
        const fedapayRes = await fetch(`${fedapayConfig.apiUrl}/transactions/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fedapayConfig.secretKey}`,
          },
        })

        const fedapayData = await fedapayRes.json()
        const transaction = fedapayData?.v1?.transaction ?? fedapayData?.['v1/transaction'] ?? fedapayData?.transaction ?? fedapayData
        const metadata = transaction?.custom_metadata || transaction?.metadata || {}

        if (metadata.type === 'subscription' && metadata.seller_id && metadata.plan) {
          const sellerId = String(metadata.seller_id)
          const rawPlan = String(metadata.plan)

          if (isValidSubscriptionPlan(rawPlan)) {
            const plan: SubscriptionPlan = rawPlan
            const expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + 30)

            const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
            if (seller) {
              await prisma.seller.update({
                where: { id: sellerId },
                data: {
                  subscription_plan: plan,
                  subscription_expires_at: expiresAt,
                },
              })

              redirectTo += `&plan=${encodeURIComponent(plan)}`
            }
          } else {
            console.error(`Plan d'abonnement invalide reçu lors de la redirection: ${rawPlan}`)
          }
        }
      } catch (err) {
        console.error('Unable to resolve FedaPay transaction metadata in redirect handler:', err)
      }
    }

    return NextResponse.redirect(redirectTo)
  } catch (err) {
    console.error('Error handling GET redirect from FedaPay:', err)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'
    return NextResponse.redirect(`${appUrl}/payment/result?status=error`)
  }
}
