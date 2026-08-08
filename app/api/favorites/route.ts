import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const url = new URL(req.url)
  const productId = url.searchParams.get('product_id')

  if (productId) {
    const favorite = await prisma.favorite.findFirst({
      where: { user_id: user.id, product_id: productId },
    })
    return NextResponse.json({ favorite: !!favorite })
  }

  const favorites = await prisma.favorite.findMany({
    where: { user_id: user.id },
    include: {
      product: {
        include: { shop: true, category: true },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ favorites })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { product_id } = await req.json()

  if (!product_id) {
    return NextResponse.json({ error: 'Produit requis.' }, { status: 400 })
  }

  const existing = await prisma.favorite.findFirst({
    where: { user_id: user.id, product_id },
  })

  if (existing) {
    return NextResponse.json({ error: 'Déjà en favoris.' }, { status: 400 })
  }

  const favorite = await prisma.favorite.create({
    data: { user_id: user.id, product_id },
  })

  return NextResponse.json({ success: true, favorite })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { product_id } = await req.json()

  await prisma.favorite.deleteMany({
    where: { user_id: user.id, product_id },
  })

  return NextResponse.json({ success: true })
}