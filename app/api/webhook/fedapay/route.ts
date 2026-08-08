import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-fedapay-signature')
    const secret = process.env.FEDAPAY_WEBHOOK_SECRET

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

    // On traite uniquement les événements liés aux transactions
    if (name === 'transaction.approved' || name === 'transaction.canceled' || name === 'transaction.failed') {
      const transactionId = String(entity.id)
      const metadata = entity.custom_metadata || entity.metadata || {}

      if (metadata.type === 'subscription') {
        if (name === 'transaction.approved') {
          const sellerId = metadata.seller_id
          const plan = metadata.plan
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
                    subscription_plan: plan as any,
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
          } catch (e: any) {
            if (e.code === 'P2002') {
              console.log(`Webhook d'abonnement déjà traité pour la transaction: ${transactionId}`)
              return NextResponse.json({ received: true }, { status: 200 })
            }
            throw e
          }
        }
        return NextResponse.json({ received: true }, { status: 200 })
      }

      const payment = await prisma.payment.findUnique({
        where: { transaction_id: transactionId }
      })

      if (!payment) {
        console.error(`Payment not found for FedaPay transaction: ${transactionId}`)
        return NextResponse.json({ received: true }, { status: 200 })
      }

      // Idempotence: Ne jamais écraser un paiement déjà capturé
      if (payment.status === 'CAPTURED') {
        return NextResponse.json({ received: true }, { status: 200 })
      }

      if (name === 'transaction.approved') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'CAPTURED', paid_at: new Date() }
          }),
          prisma.order.update({
            where: { id: payment.order_id },
            data: { status: 'COMPLETED' }
          })
        ])
      } else {
        // transaction.canceled ou transaction.failed
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' }
          }),
          prisma.order.update({
            where: { id: payment.order_id },
            data: { status: 'CANCELLED' }
          })
        ])
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
        const fedapayRes = await fetch(`https://sandbox-api.fedapay.com/v1/transactions/${encodeURIComponent(id)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
          },
        })

        const fedapayData = await fedapayRes.json()
        const transaction = fedapayData?.v1?.transaction ?? fedapayData?.['v1/transaction'] ?? fedapayData?.transaction ?? fedapayData
        const metadata = transaction?.custom_metadata || transaction?.metadata || {}

        if (metadata.type === 'subscription' && metadata.seller_id && metadata.plan) {
          const sellerId = String(metadata.seller_id)
          const plan = String(metadata.plan)
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          const seller = await prisma.seller.findUnique({ where: { id: sellerId } })
          if (seller) {
            await prisma.seller.update({
              where: { id: sellerId },
              data: {
                subscription_plan: plan as any,
                subscription_expires_at: expiresAt,
              },
            })

            redirectTo += `&plan=${encodeURIComponent(plan)}`
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
