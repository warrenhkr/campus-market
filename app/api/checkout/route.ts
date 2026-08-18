import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getCommissionRate } from '@/lib/subscription-plans'

interface CartItemInput {
  id: string
  quantity: number
}

interface ShippingChoiceInput {
  shop_id: string
  mode: 'pickup' | 'zone' | 'default'
  zone_id: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { items, phone, fullName, email, shipping } = await req.json()

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
  }
  if (!phone || !fullName || !email) {
    return NextResponse.json({ error: 'Informations de contact incomplètes.' }, { status: 400 })
  }

  const requestedItems: CartItemInput[] = items
    .filter((item: unknown): item is CartItemInput =>
      !!item && typeof item === 'object' && typeof (item as CartItemInput).id === 'string' && Number.isFinite((item as CartItemInput).quantity)
    )
    .map((item) => ({ id: item.id, quantity: Math.max(1, Math.floor(item.quantity)) }))

  const shippingChoices: ShippingChoiceInput[] = Array.isArray(shipping)
    ? shipping.filter((s: unknown): s is ShippingChoiceInput =>
        !!s && typeof s === 'object' && typeof (s as ShippingChoiceInput).shop_id === 'string'
      )
    : []

  if (requestedItems.length === 0) {
    return NextResponse.json({ error: 'Panier invalide.' }, { status: 400 })
  }

  try {
    // Ne JAMAIS faire confiance au prix/total envoyés par le client (panier
    // localStorage modifiable). On recharge chaque produit depuis la base
    // pour recalculer le prix et vérifier le stock réel au moment de payer.
    const productIds = requestedItems.map((item) => item.id)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { shop: { include: { seller: true } } },
    })

    const productById = new Map(products.map((product) => [product.id, product]))

    const missing = requestedItems.filter((item) => !productById.has(item.id))
    if (missing.length > 0) {
      return NextResponse.json({ error: 'Certains articles ne sont plus disponibles.' }, { status: 400 })
    }

    for (const item of requestedItems) {
      const product = productById.get(item.id)!
      if (!product.is_available || product.status !== 'APPROVED') {
        return NextResponse.json({ error: `"${product.name}" n'est plus en vente.` }, { status: 400 })
      }
      if (product.stock_mode === 'TRACKED' && !product.allow_backorder && product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour "${product.name}".` }, { status: 400 })
      }
    }

    // Regroupe par boutique pour calculer une commission par vendeur (chaque
    // boutique peut avoir un plan d'abonnement, donc un taux, différent).
    const totalsByShop = new Map<string, { amount: number; commissionRate: number; shippingFee: number }>()
    let total = 0

    for (const item of requestedItems) {
      const product = productById.get(item.id)!
      const lineTotal = Number(product.price) * item.quantity
      total += lineTotal

      const shopId = product.shop_id
      const commissionRate = getCommissionRate(product.shop.seller.subscription_plan)
      const current = totalsByShop.get(shopId) ?? { amount: 0, commissionRate, shippingFee: 0 }
      current.amount += lineTotal
      totalsByShop.set(shopId, current)
    }

    // Revalide chaque choix de livraison côté serveur : on ne fait jamais
    // confiance au frais annoncé par le client, on relit la zone/le pickup
    // réels de la boutique en base et on recalcule le frais nous-mêmes.
    for (const choice of shippingChoices) {
      const shopTotals = totalsByShop.get(choice.shop_id)
      if (!shopTotals) continue // boutique sans article dans ce panier : ignoré

      if (choice.mode === 'zone' && choice.zone_id) {
        const zone = await prisma.productDeliveryZone.findFirst({
          where: { id: choice.zone_id, is_active: true, product: { shop_id: choice.shop_id } },
        })
        if (zone?.fee) {
          shopTotals.shippingFee = Number(zone.fee)
          total += Number(zone.fee)
        }
      }
      // mode 'pickup' ou zone sans frais : shippingFee reste à 0 (gratuit)
    }

    // 1. Crée la commande avec les prix vérifiés côté serveur (jamais ceux du client)
    const order = await prisma.order.create({
      data: {
        user_id: user.id,
        total_amount: total,
        status: 'PENDING',
        order_items: {
          create: requestedItems.map((item) => {
            const product = productById.get(item.id)!
            return {
              product_id: item.id,
              quantity: item.quantity,
              price: product.price,
            }
          }),
        },
      },
    })

    // 2. Appel FedaPay
    const fedapayRes = await fetch('https://sandbox-api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        description: `Commande Campus Market #${order.id.slice(0, 8).toUpperCase()}`,
        amount: total,
        currency: { iso: 'XOF' },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'}/api/webhook/fedapay`,
        customer: {
          firstname: fullName.split(' ')[0],
          lastname: fullName.split(' ').slice(1).join(' ') || fullName,
          email,
          phone_number: {
            number: phone,
            country: 'BJ',
          },
        },
        metadata: { order_id: order.id },
      }),
    })

    const fedapayData = await fedapayRes.json()

    if (!fedapayRes.ok) {
      console.error('FedaPay error response:', fedapayData)
      return NextResponse.json({ success: false, error: fedapayData.message ?? 'Erreur FedaPay' }, { status: 200 })
    }

    // 3. Crée le paiement en DB, avec un split de commission par boutique.
    // Le frais de livraison va intégralement au vendeur (pas de commission
    // plateforme sur le transport, uniquement sur la vente du produit).
    const platformFeeTotal = Array.from(totalsByShop.values()).reduce(
      (sum, shop) => sum + shop.amount * shop.commissionRate,
      0
    )

    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: total,
        seller_earning: total - platformFeeTotal,
        platform_fee: platformFeeTotal,
        currency: 'FCFA',
        method: 'FedaPay',
        transaction_id: String(fedapayData.v1?.transaction?.id ?? fedapayData.transaction?.id ?? fedapayData.data?.id ?? order.id),
        status: 'PENDING',
        splits: {
          create: Array.from(totalsByShop.entries()).map(([shopId, shopTotals]) => {
            const shopPlatformFee = shopTotals.amount * shopTotals.commissionRate
            return {
              shop_id: shopId,
              amount: shopTotals.amount + shopTotals.shippingFee,
              commission_rate: shopTotals.commissionRate,
              platform_fee: shopPlatformFee,
              seller_earning: shopTotals.amount - shopPlatformFee + shopTotals.shippingFee,
            }
          }),
        },
      },
    })
    // Handle multiple response shapes and prefer explicit payment_url when provided
    const v1Transaction = fedapayData?.v1?.transaction ?? fedapayData?.['v1/transaction'] ?? null
    const transactionId = v1Transaction?.id ?? fedapayData.transaction?.id ?? fedapayData.data?.id ?? fedapayData.id
    const paymentUrlFromResp = v1Transaction?.payment_url ?? fedapayData.payment_url ?? fedapayData.data?.payment_url

    if (paymentUrlFromResp) {
      return NextResponse.json({ success: true, order_id: order.id, payment_url: paymentUrlFromResp })
    }

    if (transactionId) {
      return NextResponse.json({ success: true, order_id: order.id, payment_url: `https://sandbox-api.fedapay.com/v1/transactions/${transactionId}/pay` })
    }

    console.error('FedaPay returned no transaction id (checkout):', fedapayData)
    return NextResponse.json({ success: false, error: 'FedaPay returned no transaction id' }, { status: 200 })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 200 })
  }
}
