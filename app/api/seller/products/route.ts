import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const { name, description, price, stock, category_id, image_url } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })
  }
  if (!price || price <= 0) {
    return NextResponse.json({ error: 'Prix invalide.' }, { status: 400 })
  }

  try {
    const seller = await prisma.seller.findUnique({
      where: { user_id: user.id },
      include: { shops: { take: 1 } },
    })

    if (!seller || seller.verification_status !== 'APPROVED') {
      return NextResponse.json({ error: 'Vendeur non approuvé.' }, { status: 403 })
    }

    const shop = seller.shops[0]
    if (!shop) {
      return NextResponse.json({ error: 'Aucune boutique trouvée.' }, { status: 404 })
    }

    const product = await prisma.product.create({
      data: {
        shop_id: shop.id,
        category_id: category_id ?? null,
        name,
        description: description ?? null,
        price,
        stock: stock ?? 0,
        image_url: image_url ?? null,
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