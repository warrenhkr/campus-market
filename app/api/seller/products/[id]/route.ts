import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

async function getSeller(userId: string) {
  return prisma.seller.findUnique({
    where: { user_id: userId },
    include: { shops: { select: { id: true } } },
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const seller = await getSeller(user.id)
  if (!seller) return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })

  const shopIds = seller.shops.map(s => s.id)
  const product = await prisma.product.findFirst({ where: { id, shop_id: { in: shopIds } } })
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  const { name, description, price, stock, category_id, image_url, is_available } = await req.json()

  const updated = await prisma.product.update({
    where: { id },
    data: { name, description, price, stock, category_id, image_url, is_available },
  })

  return NextResponse.json({ success: true, product: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const seller = await getSeller(user.id)
  if (!seller) return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })

  const shopIds = seller.shops.map(s => s.id)
  const product = await prisma.product.findFirst({ where: { id, shop_id: { in: shopIds } } })
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}