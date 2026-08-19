import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  productCreateSchema,
  productDeliveryZoneSchema,
  productFaqSchema,
  productPricingTierSchema,
  productVariantSchema,
} from '@/lib/validators/product'
import { getActiveShop } from '@/lib/active-shop'

type ProductVariantInput = z.infer<typeof productVariantSchema>
type ProductDeliveryZoneInput = z.infer<typeof productDeliveryZoneSchema>
type ProductFaqInput = z.infer<typeof productFaqSchema>
type ProductPricingTierInput = z.infer<typeof productPricingTierSchema>

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
    where: { shop_id: { in: shopIds } },
    select: { id: true, name: true },
    orderBy: { created_at: 'desc' },
  })

  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const { seller, shop } = await getActiveShop(user.id)
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }
    if (!shop) {
      return NextResponse.json({ error: 'Aucune boutique associée trouvée.' }, { status: 403 })
    }

    const body = await req.json()
    const parseResult = productCreateSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json({
        error: parseResult.error.issues.map((issue) => issue.message).join(', '),
      }, { status: 400 })
    }

    const {
      name,
      slug,
      description,
      price,
      original_price,
      stock,
      stock_mode,
      low_stock_threshold,
      allow_backorder,
      category_id,
      image_url,
      type,
      promo_label,
      promo_start_at,
      promo_end_at,
      promo_auto_renew,
      cta_text,
      cta_url,
      cta_style,
      is_available,
      is_hidden_from_shop,
      hide_sales_count,
      sales_limit,
      restock_threshold,
      restock_quantity,
      post_purchase_instructions,
      require_shipping_address,
      file_password,
      watermark_files,
      seo_title,
      seo_description,
      seo_thumbnail_url,
      seo_keywords,
      variants,
      delivery_zones,
      faqs,
      pricing_tiers,
      metadata,
    } = parseResult.data

    console.log('📦 Creating product with image_url:', image_url)

    const plan = seller.subscription_plan ?? 'DECOUVERTE'
    if (plan !== 'BUSINESS' && plan !== 'PRO') {
      const activeProductsCount = await prisma.product.count({
        where: {
          shop_id: shop.id,
          status: { in: ['APPROVED', 'PENDING_REVIEW'] },
        },
      })

      const limit = plan === 'STARTER' ? 10 : 3
      if (activeProductsCount >= limit) {
        return NextResponse.json(
          {
            error: `Limite de produits atteinte pour votre plan actuel (${plan}), passez à un plan supérieur ou désactivez un produit existant.`,
          },
          { status: 403 }
        )
      }
    }

    if (slug) {
      const slugTaken = await prisma.product.findFirst({ where: { shop_id: shop.id, slug } })
      if (slugTaken) {
        return NextResponse.json({ error: `L'URL "${slug}" est déjà utilisée par un autre produit de votre boutique.` }, { status: 409 })
      }
    }

    const product = await prisma.product.create({
      data: {
        shop_id: shop.id,
        category_id: category_id ?? null,
        name,
        slug: slug ?? null,
        description: description ?? null,
        price,
        original_price: original_price ?? null,
        stock,
        stock_mode,
        low_stock_threshold: low_stock_threshold ?? null,
        allow_backorder: allow_backorder ?? false,
        image_url: image_url ?? null,
        type,
        promo_label: promo_label ?? null,
        promo_start_at: promo_start_at ?? null,
        promo_end_at: promo_end_at ?? null,
        promo_auto_renew: promo_auto_renew ?? false,
        cta_text: cta_text ?? null,
        cta_url: cta_url ?? null,
        cta_style,
        is_hidden_from_shop: is_hidden_from_shop ?? false,
        hide_sales_count: hide_sales_count ?? false,
        sales_limit: sales_limit ?? null,
        restock_threshold: restock_threshold ?? null,
        restock_quantity: restock_quantity ?? null,
        post_purchase_instructions: post_purchase_instructions ?? null,
        require_shipping_address: require_shipping_address ?? false,
        file_password: file_password ?? null,
        watermark_files: watermark_files ?? false,
        seo_title: seo_title ?? null,
        seo_description: seo_description ?? null,
        seo_thumbnail_url: seo_thumbnail_url ?? null,
        seo_keywords: seo_keywords ?? null,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
        status: 'PENDING_REVIEW',
        is_available: is_available ?? true,
        variants: variants && variants.length > 0
          ? {
              create: variants.map((variant: ProductVariantInput, index: number) => ({
                name: variant.name,
                price_delta: variant.price_delta ?? 0,
                stock_delta: variant.stock_delta ?? 0,
                sku: variant.sku ?? null,
                is_active: variant.is_active ?? true,
                position: index,
              })),
            }
          : undefined,
        delivery_zones: delivery_zones && delivery_zones.length > 0
          ? {
              create: delivery_zones.map((zone: ProductDeliveryZoneInput, index: number) => ({
                name: zone.name,
                fee: zone.fee ?? null,
                estimated_min_days: zone.estimated_min_days ?? null,
                estimated_max_days: zone.estimated_max_days ?? null,
                is_active: zone.is_active ?? true,
                position: index,
              })),
            }
          : undefined,
        faqs: faqs && faqs.length > 0
          ? {
              create: faqs.map((faq: ProductFaqInput, index: number) => ({
                question: faq.question,
                answer: faq.answer,
                is_published: faq.is_published ?? true,
                layout: faq.layout ?? 'ACCORDION',
                position: index,
              })),
            }
          : undefined,
        pricing_tiers: pricing_tiers && pricing_tiers.length > 0
          ? {
              create: pricing_tiers.map((tier: ProductPricingTierInput, index: number) => ({
                label: tier.label,
                price: tier.price,
                is_default: tier.is_default ?? false,
                position: index,
              })),
            }
          : undefined,
      },
      include: { variants: true, delivery_zones: true, faqs: true, pricing_tiers: true },
    })

    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error('Create product error:', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
