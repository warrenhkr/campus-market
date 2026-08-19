import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { reviewReplySchema } from '@/lib/validators/review'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
  if (!seller) {
    return NextResponse.json({ error: 'Accès réservé aux vendeurs.' }, { status: 403 })
  }

  const body = await req.json()
  const parseResult = reviewReplySchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 })
  }

  const shops = await prisma.shop.findMany({ where: { seller_id: seller.id }, select: { id: true } })
  const shopIds = shops.map((shop) => shop.id)

  // Vérifie que l'avis porte bien sur un produit d'une boutique du vendeur
  // connecté — jamais un vendeur ne doit pouvoir répondre à un avis sur le
  // produit d'un autre.
  const review = await prisma.review.findFirst({
    where: { id, product: { shop_id: { in: shopIds } } },
  })
  if (!review) {
    return NextResponse.json({ error: 'Avis introuvable.' }, { status: 404 })
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { seller_reply: parseResult.data.seller_reply, seller_reply_at: new Date() },
  })

  return NextResponse.json({ success: true, review: updated })
}
