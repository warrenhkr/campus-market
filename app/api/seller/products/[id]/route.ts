import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { productUpdateSchema } from '@/lib/validators/product'

async function getSeller(userId: string) {
  return prisma.seller.findUnique({
    where: { user_id: userId },
    include: { shops: { select: { id: true } } },
  })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const seller = await getSeller(user.id)
  if (!seller) return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })

  const shopIds = seller.shops.map((s) => s.id)
  const product = await prisma.product.findFirst({
    where: { id, shop_id: { in: shopIds } },
  })
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  return NextResponse.json({ product })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const seller = await getSeller(user.id)
  if (!seller) return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })

  const shopIds = seller.shops.map((s) => s.id)
  const product = await prisma.product.findFirst({ where: { id, shop_id: { in: shopIds } } })
  if (!product) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })

  const body = await req.json()
  const parseResult = productUpdateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({
      error: parseResult.error.issues.map((issue) => issue.message).join(', '),
    }, { status: 400 })
  }

  const { name, description, price, stock, category_id, image_url, type, is_available } = parseResult.data

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name,
      description: description ?? null,
      price,
      stock: stock ?? 0,
      category_id: category_id ?? null,
      image_url: image_url ?? null,
      type,
      is_available: is_available ?? product.is_available,
    },
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