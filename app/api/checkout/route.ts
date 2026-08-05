import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  shop_name: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { items, total, phone, fullName, email } = await req.json()

  if (!items?.length) {
    return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
  }

  try {
    // 1. Crée la commande dans la DB
    const order = await prisma.order.create({
      data: {
        user_id: user.id,
        total_amount: total,
        status: 'PENDING',
        order_items: {
          create: items.map((item: CartItem) => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
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
      return NextResponse.json(
        { error: fedapayData.message ?? 'Erreur FedaPay' },
        { status: 400 }
      )
    }

    // 3. Crée le paiement en DB
    await prisma.payment.create({
      data: {
        order_id: order.id,
        amount: total,
        seller_earning: total * 0.9,
        platform_fee: total * 0.1,
        currency: 'FCFA',
        method: 'FedaPay',
        transaction_id: String(fedapayData.v1?.transaction?.id ?? order.id),
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      order_id: order.id,
      payment_url: `https://sandbox-api.fedapay.com/v1/transactions/${fedapayData.v1?.transaction?.id}/pay`,
    })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}