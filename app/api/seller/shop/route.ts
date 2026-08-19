import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const body = await req.json()
  const { shopId, name, description, contact_name, contact_phone, facebook_url, instagram_url, website_url } = body

  if (!shopId || !name?.trim()) {
    return NextResponse.json({ error: 'ID de boutique et nom requis.' }, { status: 400 })
  }

  try {
    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop || shop.seller_id !== seller.id) {
      return NextResponse.json({ error: 'Boutique introuvable ou accès refusé.' }, { status: 404 })
    }

    await prisma.shop.update({
      where: { id: shopId },
      data: {
        name,
        description: description ?? null,
        contact_name: contact_name ?? null,
        contact_phone: contact_phone ?? null,
        facebook_url: facebook_url ?? null,
        instagram_url: instagram_url ?? null,
        website_url: website_url ?? null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Shop update error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
