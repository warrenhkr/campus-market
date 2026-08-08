import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { plan } = await req.json()

  if (!['STARTER', 'BUSINESS'].includes(plan)) {
    return NextResponse.json({ error: 'Plan invalide pour le paiement.' }, { status: 400 })
  }

  const amount = plan === 'STARTER' ? 500 : 1000

  try {
    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 404 })
    }

    const fedapayRes = await fetch('https://sandbox-api.fedapay.com/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        description: `Abonnement ${plan} - Campus Market`,
        amount: amount,
        currency: { iso: 'XOF' },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'}/api/webhook/fedapay`,
        customer: {
          email: user.email,
        },
        metadata: { 
          type: 'subscription',
          seller_id: seller.id,
          plan: plan,
        },
      }),
    })

    const fedapayData = await fedapayRes.json()

    if (!fedapayRes.ok) {
      console.error('FedaPay error response:', fedapayData)
      return NextResponse.json(
        { success: false, error: fedapayData.message ?? 'Erreur FedaPay' },
        { status: 200 }
      )
    }

    // FedaPay may return different shapes. Prefer any explicit payment_url, otherwise extract id.
    const v1Transaction = fedapayData?.v1?.transaction ?? fedapayData?.['v1/transaction'] ?? null
    const transactionId = v1Transaction?.id ?? fedapayData.transaction?.id ?? fedapayData.data?.id ?? fedapayData.id
    const paymentUrlFromResp = v1Transaction?.payment_url ?? fedapayData.payment_url ?? fedapayData.data?.payment_url

    if (paymentUrlFromResp) {
      return NextResponse.json({ success: true, payment_url: paymentUrlFromResp })
    }

    if (transactionId) {
      return NextResponse.json({ success: true, payment_url: `https://sandbox-api.fedapay.com/v1/transactions/${transactionId}/pay` })
    }

    console.error('FedaPay returned no transaction id nor payment_url:', fedapayData)
    return NextResponse.json({ success: false, error: 'FedaPay returned no transaction id' }, { status: 200 })
  } catch (err) {
    console.error('Subscription checkout error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 200 })
  }
}
