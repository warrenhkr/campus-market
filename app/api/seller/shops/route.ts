import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
  if (!seller) {
    return NextResponse.json({ error: 'Deviens vendeur avant de créer une boutique.' }, { status: 403 })
  }

  const { name, description } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nom de boutique requis.' }, { status: 400 })
  }

  const baseSlug = String(name)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const shop = await prisma.shop.create({
    data: {
      seller_id: seller.id,
      name,
      slug: `${baseSlug}-${Date.now()}`,
      description: description ?? null,
    },
  })

  return NextResponse.json({ success: true, shop })
}
