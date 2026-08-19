import { NextRequest, NextResponse } from 'next/server'
import type { OrderStatus } from '@prisma/client'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { reviewCreateSchema } from '@/lib/validators/review'

const COMPLETED_STATUSES: OrderStatus[] = ['COMPLETED', 'SHIPPED', 'DELIVERED']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Connecte-toi pour laisser un avis.' }, { status: 401 })
  }

  const body = await req.json()
  const parseResult = reviewCreateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.issues[0]?.message ?? 'Données invalides.' }, { status: 400 })
  }
  const { product_id, rating, comment } = parseResult.data

  const product = await prisma.product.findUnique({ where: { id: product_id }, select: { id: true } })
  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 })
  }

  // Un avis ne peut être laissé qu'une fois par personne et par produit
  // (contrainte déjà en base, vérifiée ici pour renvoyer un message clair).
  const existing = await prisma.review.findUnique({
    where: { product_id_user_id: { product_id, user_id: user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Tu as déjà laissé un avis sur ce produit.' }, { status: 409 })
  }

  // Vérifie que l'utilisateur a réellement acheté ce produit (commande
  // aboutie) — l'avis est marqué "achat vérifié" en conséquence, mais on
  // n'interdit pas totalement l'avis à ceux qui n'ont pas acheté : certains
  // marketplaces l'autorisent pour la découverte/le service client. On se
  // contente ici de valoriser l'achat vérifié plutôt que de bloquer.
  const purchase = await prisma.orderItem.findFirst({
    where: {
      product_id,
      order: { user_id: user.id, status: { in: COMPLETED_STATUSES } },
    },
  })

  const review = await prisma.review.create({
    data: {
      product_id,
      user_id: user.id,
      rating,
      comment: comment || null,
      is_verified_purchase: !!purchase,
    },
    include: { user: { select: { name: true, email: true } } },
  })

  return NextResponse.json({ success: true, review })
}
