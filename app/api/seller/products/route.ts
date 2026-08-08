import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { productCreateSchema } from '@/lib/validators/product'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const body = await req.json()
  const parseResult = productCreateSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json({
      error: parseResult.error.issues.map((issue) => issue.message).join(', '),
    }, { status: 400 })
  }

  const { name, description, price, stock, category_id, image_url, type } = parseResult.data

  try {
    const seller = await prisma.seller.findUnique({
      where: { user_id: user.id },
      include: { shops: { take: 1 } },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    if (seller.verification_status === 'REJECTED') {
      return NextResponse.json({ error: 'Vendeur non approuvé.' }, { status: 403 })
    }

    const shop = seller.shops[0]
    if (!shop) {
      return NextResponse.json({ error: 'Aucune boutique trouvée.' }, { status: 404 })
    }

    // --- Subscription limits check ---
    const plan = seller.subscription_plan || 'DECOUVERTE'
    if (plan !== 'BUSINESS' && plan !== 'PRO') {
      const activeProductsCount = await prisma.product.count({
        where: {
          shop_id: shop.id,
          status: { in: ['APPROVED', 'PENDING_REVIEW'] }
        }
      })

      const limit = plan === 'STARTER' ? 10 : 3
      if (activeProductsCount >= limit) {
        return NextResponse.json(
          { error: `Limite de produits atteinte pour votre plan actuel (${plan}), passez à un plan supérieur ou désactivez un produit existant.` },
          { status: 403 }
        )
      }
    }
    // ---------------------------------

    const product = await prisma.product.create({
      data: {
        shop_id: shop.id,
        category_id: category_id ?? null,
        name,
        description: description ?? null,
        price,
        stock: stock ?? 0,
        image_url: image_url ?? null,
        type,
        status: 'PENDING_REVIEW',
        is_available: true,
      },
    })

    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error('Create product error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}