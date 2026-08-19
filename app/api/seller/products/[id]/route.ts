import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import {
  productDeliveryZoneSchema,
  productFaqSchema,
  productPricingTierSchema,
  productUpdateSchema,
  productVariantSchema,
} from '@/lib/validators/product'
import type { Prisma } from '@prisma/client'

type ProductVariantInput = z.infer<typeof productVariantSchema>
type ProductDeliveryZoneInput = z.infer<typeof productDeliveryZoneSchema>
type ProductFaqInput = z.infer<typeof productFaqSchema>
type ProductPricingTierInput = z.infer<typeof productPricingTierSchema>

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
    include: {
      variants: { orderBy: { position: 'asc' } },
      delivery_zones: { orderBy: { position: 'asc' } },
      faqs: { orderBy: { position: 'asc' } },
      pricing_tiers: { orderBy: { position: 'asc' } },
      shop: { select: { slug: true } },
    },
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
      error: parseResult.error.issues.map((issue: { message: string }) => issue.message).join(', '),
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
  } = parseResult.data

  if (slug) {
    const slugTaken = await prisma.product.findFirst({ where: { shop_id: product.shop_id, slug, id: { not: id } } })
    if (slugTaken) {
      return NextResponse.json({ error: `L'URL "${slug}" est déjà utilisée par un autre produit de votre boutique.` }, { status: 409 })
    }
  }

  const metadata = parseResult.data.metadata ?? product.metadata ?? {}

  const updated = await prisma.$transaction(async (tx) => {
    if (variants) {
      await tx.productVariant.deleteMany({ where: { product_id: id } })
    }
    if (delivery_zones) {
      await tx.productDeliveryZone.deleteMany({ where: { product_id: id } })
    }
    if (faqs) {
      await tx.productFaq.deleteMany({ where: { product_id: id } })
    }
    if (pricing_tiers) {
      await tx.productPricingTier.deleteMany({ where: { product_id: id } })
    }

    return tx.product.update({
      where: { id },
      data: {
        name,
        slug: slug ?? null,
        description: description ?? null,
        price,
        original_price: original_price ?? null,
        stock: stock ?? 0,
        stock_mode,
        low_stock_threshold: low_stock_threshold ?? null,
        allow_backorder: allow_backorder ?? false,
        category_id: category_id ?? null,
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
        metadata: metadata as Prisma.InputJsonValue,
        is_available: is_available ?? product.is_available,
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