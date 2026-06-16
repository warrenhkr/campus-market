import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { shopName, description } = await req.json()

  if (!shopName?.trim()) {
    return NextResponse.json({ error: 'Nom de boutique requis.' }, { status: 400 })
  }

  // Vérifie si déjà vendeur
  const existing = await prisma.seller.findUnique({
    where: { user_id: user.id },
  })

  if (existing) {
    return NextResponse.json({ error: 'Tu as déjà une boutique.' }, { status: 400 })
  }

  // Slug depuis le nom
  const slug = shopName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  // Crée le seller + shop
  await prisma.seller.create({
    data: {
      user_id: user.id,
      shop_name: shopName,
      description,
      verification_status: 'PENDING',
      shops: {
        create: {
          name: shopName,
          slug: `${slug}-${Date.now()}`,
          description,
        },
      },
    },
  })

  return NextResponse.json({ success: true })
}