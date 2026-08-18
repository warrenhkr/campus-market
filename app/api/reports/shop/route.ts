import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const shopId = typeof body?.shopId === 'string' ? body.shopId : ''
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''
    const details = typeof body?.details === 'string' ? body.details.trim() : ''

    if (!shopId || !reason) {
      return NextResponse.json({ error: 'Boutique et motif du signalement requis.' }, { status: 400 })
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 })
    }

    const report = await prisma.report.create({
      data: {
        user_id: user.id,
        seller_id: shop.seller_id,
        reason,
        description: details || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('report/shop POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
