import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { shopSettingsSchema } from '@/lib/validators/shop-settings'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const seller = await prisma.seller.findUnique({
    where: { user_id: user.id },
    include: { shops: { select: { id: true, name: true, slug: true, logo_url: true }, orderBy: { created_at: 'asc' } } },
  })
  if (!seller) {
    return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
  }

  return NextResponse.json({ shops: seller.shops })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = shopSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Données invalides.' }, { status: 400 })
    }

    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })
    }

    const shop = await prisma.shop.findUnique({ where: { id: body.shopId } })
    if (!shop || shop.seller_id !== seller.id) {
      return NextResponse.json({ error: 'Boutique introuvable ou accès refusé.' }, { status: 404 })
    }

    const data = parsed.data

    // Helper to resolve media id to metadata when it belongs to this shop
    const resolveMedia = async (mediaId?: string | null) => {
      if (!mediaId) return { id: null as string | null, public_id: null as string | null, url: null as string | null }
      try {
        const media = await prisma.storeMedia.findUnique({ where: { id: mediaId } })
        if (media && media.shop_id === body.shopId) {
          return { id: media.id, public_id: media.public_id, url: media.url }
        }
      } catch (e) {
        console.warn('Failed to resolve StoreMedia for mediaId', mediaId, e)
      }
      return { id: null, public_id: null, url: null }
    }

    const resolvedOg = await resolveMedia(data.og_image_media_id ?? null)
    const resolvedLogo = await resolveMedia(data.logo_media_id ?? null)
    const resolvedBanner = await resolveMedia(data.banner_media_id ?? null)
    const resolvedFavicon = await resolveMedia(data.favicon_media_id ?? null)

    await prisma.shop.update({
      where: { id: body.shopId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        contact_name: data.contact_name ?? null,
        contact_phone: data.contact_phone ?? null,
        logo_url: resolvedLogo.url ?? data.logo_url ?? null,
        banner_url: resolvedBanner.url ?? data.banner_url ?? null,
        favicon_url: resolvedFavicon.url ?? data.favicon_url ?? null,
        whatsapp_url: data.whatsapp_url ?? null,
        facebook_url: data.facebook_url ?? null,
        instagram_url: data.instagram_url ?? null,
        tiktok_url: data.tiktok_url ?? null,
        youtube_url: data.youtube_url ?? null,
        website_url: data.website_url ?? null,
        og_image_url: resolvedOg.url ?? data.og_image_url ?? null,
        og_image_public_id: resolvedOg.public_id ?? data.og_image_public_id ?? null,
        og_image_media_id: resolvedOg.id ?? null,
        logo_media_id: resolvedLogo.id ?? data.logo_media_id ?? null,
        banner_media_id: resolvedBanner.id ?? data.banner_media_id ?? null,
        favicon_media_id: resolvedFavicon.id ?? data.favicon_media_id ?? null,
        currency: data.currency ?? 'XOF',
        language: data.language ?? 'fr',
        timezone: data.timezone ?? 'Africa/Porto-Novo',
        status: data.status ?? 'ACTIVE',
        primary_color: data.primary_color ?? null,
        secondary_color: data.secondary_color ?? null,
        accent_color: data.accent_color ?? null,
        background_color: data.background_color ?? null,
        text_color: data.text_color ?? null,
        show_banner: data.show_banner ?? true,
        show_categories: data.show_categories ?? true,
        show_featured_products: data.show_featured_products ?? true,
        show_new_products: data.show_new_products ?? true,
        show_reviews: data.show_reviews ?? true,
        show_contact: data.show_contact ?? true,
        show_social_links: data.show_social_links ?? true,
        delivery_enabled: data.delivery_enabled ?? false,
        delivery_fee: data.delivery_fee ?? null,
        free_delivery_threshold: data.free_delivery_threshold ?? null,
        pickup_enabled: data.pickup_enabled ?? true,
        campus_delivery_enabled: data.campus_delivery_enabled ?? true,
        local_delivery_enabled: data.local_delivery_enabled ?? false,
        allow_guest_checkout: data.allow_guest_checkout ?? true,
        allow_cancellation: data.allow_cancellation ?? true,
        meta_title: data.meta_title ?? null,
        meta_description: data.meta_description ?? null,
      },
    })

    if (data.og_image_public_id !== undefined) {
      await prisma.shop.update({
        where: { id: body.shopId },
        data: { og_image_public_id: data.og_image_public_id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Shop settings update error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
