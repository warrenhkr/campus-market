import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { seller_id: seller.id },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ success: true, withdrawals })
  } catch (error) {
    console.error('seller/withdrawals GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const amount = Number(body?.amount)
    const method = String(body?.method ?? 'MOMO')
    const account = body?.account ?? {}

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 })
    }

    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    // La vérification KYC n'est plus bloquante pour les retraits. La police de
    // contenu et la modération restent la vraie protection contre les usages
    // abusifs ou interdits.
    const withdrawal = await prisma.withdrawal.create({
      data: {
        seller_id: seller.id,
        amount,
        method,
        account,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, withdrawal })
  } catch (error) {
    console.error('seller/withdrawals POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
