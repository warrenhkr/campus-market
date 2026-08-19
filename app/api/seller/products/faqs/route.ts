import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { user_id: user.id },
    include: { shops: { select: { id: true } } },
  })
  if (!seller) {
    return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
  }

  const shopIds = seller.shops.map((shop) => shop.id)

  const products = await prisma.product.findMany({
    where: { shop_id: { in: shopIds }, faqs: { some: {} } },
    select: {
      id: true,
      name: true,
      faqs: {
        select: { question: true, answer: true, layout: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ products })
}
