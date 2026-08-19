import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getActiveShop } from '@/lib/active-shop'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, Edit, ArrowRight, Settings2, Star } from '@/components/ServerIcons'
import { ShopSettingsForm } from '@/components/seller/ShopSettingsForm'
import { ShareLinkButton } from '@/components/ShareLinkButton'

async function getShopDetails(shopId: string) {
  try {
    return await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        products: {
          where: { status: 'APPROVED', is_available: true },
          include: { reviews: true },
          orderBy: { created_at: 'desc' },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function SellerShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { seller, shop: activeShop } = await getActiveShop(user.id)
  if (!seller) redirect('/become-seller')

  const shop = activeShop ? await getShopDetails(activeShop.id) : null

  if (!shop) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Aucune boutique trouvée
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Ta boutique n&apos;a pas encore été créée par l&apos;admin.
        </p>
        <Link href="/seller"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          Retour au dashboard
        </Link>
      </div>
    )
  }

  const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'}/shop/${shop.slug}`
  const shopSettingsPayload = shop as unknown as Record<string, unknown>

  const totalReviews = shop.products.flatMap(p => p.reviews)
  const avgRating = totalReviews.length > 0
    ? totalReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews.length
    : 0

  return (
    <div className="w-full px-4 pb-12 pt-4 sm:px-6 lg:px-8 md:pt-5">

      {/* Header boutique */}
      <AnimatedSection delay={0}>
        <Card className="rounded-3xl border border-border p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none"
            style={{ background: 'var(--primary)', transform: 'translate(30%, -30%)' }} />

          <div className="flex items-start gap-6 relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}>
              {shop.image_url ? (
                <Image src={shop.image_url} alt={shop.name} width={80} height={80}
                  className="object-cover w-full h-full" />
              ) : (
                <Store size={32} style={{ color: 'var(--primary)' }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold mb-1"
                style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                {shop.name}
              </h1>
              {shop.description && (
                <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  {shop.description}
                </p>
              )}
              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                    {shop.products.length} produit{shop.products.length > 1 ? 's' : ''}
                  </span>
                  {totalReviews.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={12} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                      {avgRating.toFixed(1)} ({totalReviews.length} avis)
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <span>/ {shop.slug}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="truncate text-xs" style={{ color: 'var(--muted-foreground)' }}>{shopUrl}</span>
                  <ShareLinkButton url={shopUrl} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <Button asChild variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href={`/shop/${shop.slug}`}>
                  Voir la boutique <ArrowRight size={12} />
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ color: 'var(--foreground)' }}>
                <Link href="/seller/settings">
                  <Settings2 size={12} /> Paramètres
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ color: 'var(--foreground)' }}>
                <Link href={shopUrl} target="_blank" rel="noreferrer">
                  Partager
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <Card className="rounded-3xl border border-border p-8 mb-8">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Paramètres de la boutique
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Gérez les informations générales, l’apparence, la livraison, les préférences de paiement et les réseaux sociaux de votre boutique.
            </p>
          </CardHeader>
          <CardContent>
            <ShopSettingsForm
              shop={{
                id: String(shopSettingsPayload.id ?? ''),
                name: String(shopSettingsPayload.name ?? ''),
                slug: String(shopSettingsPayload.slug ?? ''),
                description: shopSettingsPayload.description ? String(shopSettingsPayload.description) : null,
                email: shopSettingsPayload.email ? String(shopSettingsPayload.email) : null,
                phone: shopSettingsPayload.phone ? String(shopSettingsPayload.phone) : null,
                image_url: shopSettingsPayload.image_url ? String(shopSettingsPayload.image_url) : null,
                logo_url: shopSettingsPayload.logo_url ? String(shopSettingsPayload.logo_url) : null,
                banner_url: shopSettingsPayload.banner_url ? String(shopSettingsPayload.banner_url) : null,
                favicon_url: shopSettingsPayload.favicon_url ? String(shopSettingsPayload.favicon_url) : null,
                contact_name: shopSettingsPayload.contact_name ? String(shopSettingsPayload.contact_name) : null,
                contact_phone: shopSettingsPayload.contact_phone ? String(shopSettingsPayload.contact_phone) : null,
                whatsapp_url: shopSettingsPayload.whatsapp_url ? String(shopSettingsPayload.whatsapp_url) : null,
                facebook_url: shopSettingsPayload.facebook_url ? String(shopSettingsPayload.facebook_url) : null,
                instagram_url: shopSettingsPayload.instagram_url ? String(shopSettingsPayload.instagram_url) : null,
                website_url: shopSettingsPayload.website_url ? String(shopSettingsPayload.website_url) : null,
                currency: shopSettingsPayload.currency ? String(shopSettingsPayload.currency) : null,
                language: shopSettingsPayload.language ? String(shopSettingsPayload.language) : null,
                timezone: shopSettingsPayload.timezone ? String(shopSettingsPayload.timezone) : null,
                status: shopSettingsPayload.status ? String(shopSettingsPayload.status) : null,
                primary_color: shopSettingsPayload.primary_color ? String(shopSettingsPayload.primary_color) : null,
                secondary_color: shopSettingsPayload.secondary_color ? String(shopSettingsPayload.secondary_color) : null,
                accent_color: shopSettingsPayload.accent_color ? String(shopSettingsPayload.accent_color) : null,
                background_color: shopSettingsPayload.background_color ? String(shopSettingsPayload.background_color) : null,
                text_color: shopSettingsPayload.text_color ? String(shopSettingsPayload.text_color) : null,
                show_banner: typeof shopSettingsPayload.show_banner === 'boolean' ? shopSettingsPayload.show_banner : null,
                show_categories: typeof shopSettingsPayload.show_categories === 'boolean' ? shopSettingsPayload.show_categories : null,
                show_featured_products: typeof shopSettingsPayload.show_featured_products === 'boolean' ? shopSettingsPayload.show_featured_products : null,
                show_new_products: typeof shopSettingsPayload.show_new_products === 'boolean' ? shopSettingsPayload.show_new_products : null,
                show_reviews: typeof shopSettingsPayload.show_reviews === 'boolean' ? shopSettingsPayload.show_reviews : null,
                show_contact: typeof shopSettingsPayload.show_contact === 'boolean' ? shopSettingsPayload.show_contact : null,
                show_social_links: typeof shopSettingsPayload.show_social_links === 'boolean' ? shopSettingsPayload.show_social_links : null,
                delivery_enabled: typeof shopSettingsPayload.delivery_enabled === 'boolean' ? shopSettingsPayload.delivery_enabled : null,
                delivery_fee: shopSettingsPayload.delivery_fee ? Number(shopSettingsPayload.delivery_fee) : null,
                free_delivery_threshold: shopSettingsPayload.free_delivery_threshold ? Number(shopSettingsPayload.free_delivery_threshold) : null,
                pickup_enabled: typeof shopSettingsPayload.pickup_enabled === 'boolean' ? shopSettingsPayload.pickup_enabled : null,
                campus_delivery_enabled: typeof shopSettingsPayload.campus_delivery_enabled === 'boolean' ? shopSettingsPayload.campus_delivery_enabled : null,
                local_delivery_enabled: typeof shopSettingsPayload.local_delivery_enabled === 'boolean' ? shopSettingsPayload.local_delivery_enabled : null,
                allow_guest_checkout: typeof shopSettingsPayload.allow_guest_checkout === 'boolean' ? shopSettingsPayload.allow_guest_checkout : null,
                allow_cancellation: typeof shopSettingsPayload.allow_cancellation === 'boolean' ? shopSettingsPayload.allow_cancellation : null,
                meta_title: shopSettingsPayload.meta_title ? String(shopSettingsPayload.meta_title) : null,
                meta_description: shopSettingsPayload.meta_description ? String(shopSettingsPayload.meta_description) : null,
              }}
            />
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Produits */}
      <AnimatedSection delay={0.1}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            Produits en vente
          </h2>
          <Button asChild variant="secondary" className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <Link href="/seller/products/new">+ Ajouter</Link>
          </Button>
        </div>

        {shop.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shop.products.map((product, i) => (
              <AnimatedCard key={product.id} index={i}>
                <Card className="rounded-3xl overflow-hidden border border-border">
                  <div className="relative overflow-hidden flex items-center justify-center"
                    style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name}
                        fill className="object-cover" />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold mb-1 line-clamp-1"
                      style={{ color: 'var(--foreground)' }}>
                      {product.name}
                    </p>
                    <p className="text-base font-bold mb-3" style={{ color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('fr-FR').format(Number(product.price))} FCFA
                    </p>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" className="flex-1 py-2 rounded-lg text-xs font-medium">
                        <Link href={`/products/${product.id}`}>Voir</Link>
                      </Button>
                      <Button asChild variant="secondary" className="w-8 h-8 rounded-lg">
                        <Link href={`/seller/products/${product.id}/edit`}>
                          <Edit size={13} />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-4xl mb-4">📦</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Aucun produit
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Commence par ajouter ton premier produit.
            </p>
            <Link href="/seller/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              + Ajouter un produit
            </Link>
          </div>
        )}
      </AnimatedSection>
    </div>
  )
}