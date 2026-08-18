import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { ShareLinkButton } from '@/components/ShareLinkButton'
import { Store, Package, Star } from '@/components/ServerIcons'

async function getShop(slug: string) {
  try {
    return await prisma.shop.findUnique({
      where: { slug },
      include: {
        seller: {
          include: { user: { select: { name: true, created_at: true } } },
        },
        products: {
          where: { status: 'APPROVED', is_available: true },
          include: {
            reviews: { include: { user: { select: { name: true } } } },
            category: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const shop = await getShop(slug)
  if (!shop) {
    return { title: 'Boutique Campus Market' }
  }

  return {
    title: shop.meta_title ?? shop.name,
    description: shop.meta_description ?? shop.description ?? undefined,
    openGraph: {
      title: shop.meta_title ?? shop.name,
      description: shop.meta_description ?? shop.description ?? undefined,
      type: 'website',
      images: shop.og_image_url ? [{ url: shop.og_image_url, alt: shop.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: shop.meta_title ?? shop.name,
      description: shop.meta_description ?? shop.description ?? undefined,
      images: shop.og_image_url ? [shop.og_image_url] : undefined,
    },
    icons: (shop as typeof shop & { favicon_url?: string | null }).favicon_url
      ? { icon: (shop as typeof shop & { favicon_url?: string | null }).favicon_url as string }
      : undefined,
  }
}

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  const numeric = Number.parseInt(full, 16)
  const r = (numeric >> 16) & 255
  const g = (numeric >> 8) & 255
  const b = numeric & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const sanitizeShopHtml = (value: string | null | undefined) => {
  if (!value) return ''

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '#')
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const shop = await getShop(slug)
  if (!shop) notFound()

  const shopUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000'}/shop/${shop.slug}`

  const allReviews = shop.products.flatMap(p => p.reviews)
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0

  const shopConfig = {
    primaryColor: (shop as typeof shop & { primary_color?: string | null }).primary_color,
    textColor: (shop as typeof shop & { text_color?: string | null }).text_color,
    backgroundColor: (shop as typeof shop & { background_color?: string | null }).background_color,
    logoUrl: (shop as typeof shop & { logo_url?: string | null }).logo_url,
    bannerUrl: (shop as typeof shop & { banner_url?: string | null }).banner_url,
    showBanner: (shop as typeof shop & { show_banner?: boolean | null }).show_banner,
    showContact: (shop as typeof shop & { show_contact?: boolean | null }).show_contact,
    showSocialLinks: (shop as typeof shop & { show_social_links?: boolean | null }).show_social_links,
    showCategories: (shop as typeof shop & { show_categories?: boolean | null }).show_categories,
    showFeaturedProducts: (shop as typeof shop & { show_featured_products?: boolean | null }).show_featured_products,
    showNewProducts: (shop as typeof shop & { show_new_products?: boolean | null }).show_new_products,
    showReviews: (shop as typeof shop & { show_reviews?: boolean | null }).show_reviews,
    email: (shop as typeof shop & { email?: string | null }).email,
    contactPhone: (shop as typeof shop & { contact_phone?: string | null }).contact_phone,
    tiktokUrl: (shop as typeof shop & { tiktok_url?: string | null }).tiktok_url,
    youtubeUrl: (shop as typeof shop & { youtube_url?: string | null }).youtube_url,
    ogImageUrl: (shop as typeof shop & { og_image_url?: string | null }).og_image_url,
    secondaryColor: (shop as typeof shop & { secondary_color?: string | null }).secondary_color,
    accentColor: (shop as typeof shop & { accent_color?: string | null }).accent_color,
    faviconUrl: (shop as typeof shop & { favicon_url?: string | null }).favicon_url,
  }

  const categories = shop.products
    .map((product) => product.category)
    .filter((category): category is NonNullable<typeof shop.products[number]['category']> => Boolean(category))
    .reduce<NonNullable<typeof shop.products[number]['category']>[]>((acc, category) => {
      if (!acc.some((item) => item.id === category.id)) acc.push(category)
      return acc
    }, [])

  const featuredProducts = shopConfig.showFeaturedProducts
    ? shop.products.filter((product) => product.reviews.length > 0).slice(0, 4)
    : []

  const newProducts = shopConfig.showNewProducts
    ? shop.products.slice(0, 4)
    : []

  const styleVars = {
    '--primary': shopConfig.primaryColor ?? 'var(--primary)',
    '--primary-dim': shopConfig.primaryColor ? `${shopConfig.primaryColor}20` : 'var(--primary-dim)',
    '--primary-border': shopConfig.primaryColor ? `${shopConfig.primaryColor}40` : 'var(--primary-border)',
    '--secondary': shopConfig.secondaryColor ?? 'var(--primary)',
    '--accent': shopConfig.accentColor ?? 'var(--surface-2)',
    '--foreground': shopConfig.textColor ?? 'var(--foreground)',
    '--background': shopConfig.backgroundColor ?? 'var(--background)',
    '--surface': shopConfig.backgroundColor ?? 'var(--surface)',
    '--muted-foreground': shopConfig.textColor ? hexToRgba(shopConfig.textColor, 0.72) : 'var(--muted-foreground)',
    '--border': shopConfig.textColor ? hexToRgba(shopConfig.textColor, 0.15) : 'var(--border)',
    '--subtle': shopConfig.textColor ? hexToRgba(shopConfig.textColor, 0.55) : 'var(--subtle)',
  } as React.CSSProperties

  return (
    <div
      className="min-h-screen w-full py-10"
      style={{
        ...styleVars,
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      <div className="px-2 sm:px-4 lg:px-0">

      {/* Breadcrumb */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-2 mb-8 text-xs"
          style={{ color: 'var(--muted-foreground)' }}>
          <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground transition-colors">Produits</Link>
          <span>/</span>
          <span style={{ color: 'var(--foreground)' }}>{shop.name}</span>
        </div>
      </AnimatedSection>

      {/* Header boutique */}
      <AnimatedSection delay={0.1}>
        <div className="rounded-3xl p-8 mb-10 relative overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none"
            style={{ background: 'var(--primary)', transform: 'translate(30%, -30%)' }} />

          <div className="flex items-start gap-6 relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}>
              {shopConfig.logoUrl ? (
                <Image src={shopConfig.logoUrl} alt={shop.name} width={80} height={80}
                  className="object-cover w-full h-full" />
              ) : shop.image_url ? (
                <Image src={shop.image_url} alt={shop.name} width={80} height={80}
                  className="object-cover w-full h-full" />
              ) : (
                <Store size={32} style={{ color: 'var(--primary)' }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold mb-1"
                  style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                  {shop.name}
                </h1>
                <ShareLinkButton url={shopUrl} />
              </div>
              {shop.description && (
                <div
                  className="shop-description mb-3 text-sm leading-6"
                  style={{ color: 'var(--muted-foreground)' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeShopHtml(shop.description) }}
                />
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {shopConfig.showContact && (shopConfig.contactPhone || shopConfig.email) && (
                  <span className="text-xs rounded-full border px-3 py-1" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    {shopConfig.contactPhone || shopConfig.email}
                  </span>
                )}
                {shopConfig.showSocialLinks && (shop.facebook_url || shop.instagram_url || shop.whatsapp_url || shop.website_url) && (
                  <span className="text-xs rounded-full border px-3 py-1" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                    Réseaux disponibles
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}>
                  {shop.products.length} produit{shop.products.length > 1 ? 's' : ''}
                </span>
                {allReviews.length > 0 && (
                  <span className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Star size={12} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                    {avgRating.toFixed(1)} ({allReviews.length} avis)
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                  Vendeur depuis {new Date(shop.seller.user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {shopConfig.showBanner && shopConfig.bannerUrl && (
        <AnimatedSection delay={0.12}>
          <div className="mb-8 overflow-hidden rounded-3xl border border-border">
            <Image src={shopConfig.bannerUrl} alt={shop.name} width={1200} height={400} className="h-56 w-full object-cover" />
          </div>
        </AnimatedSection>
      )}

      {shopConfig.showCategories && categories.length > 0 && (
        <AnimatedSection delay={0.14}>
          <div className="mb-8 rounded-3xl border border-border p-6" style={{ background: 'var(--accent)' }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Catégories
            </h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <span key={category.id} className="rounded-full border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {shopConfig.showReviews && allReviews.length > 0 && (
        <AnimatedSection delay={0.16}>
          <div className="mb-8 rounded-3xl border border-border p-6" style={{ background: 'var(--accent)' }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                    Avis clients
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Moyenne basée sur {allReviews.length} avis.
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                  {avgRating.toFixed(1)} / 5
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {allReviews.slice(0, 3).map((review, index) => (
                  <div key={`${review.id}-${index}`} className="rounded-3xl border border-border p-4" style={{ background: 'var(--surface)' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      {review.user?.name ?? 'Client'}
                    </p>
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, rank) => (
                        <Star key={rank} size={12} fill={rank < review.rating ? '#F59E0B' : 'none'} style={{ color: '#F59E0B' }} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{review.comment ?? 'Aucun commentaire fourni.'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {shopConfig.showFeaturedProducts && featuredProducts.length > 0 && (
        <AnimatedSection delay={0.18}>
          <div className="mb-8 rounded-3xl border border-border p-6" style={{ background: 'var(--accent)' }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Produits phares
                </p>
                <p className="text-sm text-muted-foreground">Nos produits les plus appréciés.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <AnimatedCard key={product.id} index={0}>
                  <Link href={`/products/${product.id}`} className="group block">
                    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="relative overflow-hidden flex items-center justify-center" style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <Package size={32} style={{ color: 'var(--subtle)' }} />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{product.name}</p>
                        <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                          {new Intl.NumberFormat('fr-FR').format(Number(product.price))} FCFA
                        </p>
                      </div>
                    </div>
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {shopConfig.showNewProducts && newProducts.length > 0 && (
        <AnimatedSection delay={0.2}>
          <div className="mb-8 rounded-3xl border border-border p-6" style={{ background: 'var(--accent)' }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Nouveautés
                </p>
                <p className="text-sm text-muted-foreground">Derniers produits ajoutés en boutique.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newProducts.map((product) => (
                <AnimatedCard key={product.id} index={0}>
                  <Link href={`/products/${product.id}`} className="group block">
                    <div className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="relative overflow-hidden flex items-center justify-center" style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <Package size={32} style={{ color: 'var(--subtle)' }} />
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{product.name}</p>
                        <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                          {new Intl.NumberFormat('fr-FR').format(Number(product.price))} FCFA
                        </p>
                      </div>
                    </div>
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {shopConfig.showSocialLinks && (shop.facebook_url || shop.instagram_url || shop.whatsapp_url || shop.website_url || shopConfig.tiktokUrl || shopConfig.youtubeUrl) && (
        <AnimatedSection delay={0.14}>
          <div className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-border p-4" style={{ background: 'var(--accent)' }}>
            {shop.facebook_url && <Link href={shop.facebook_url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm">Facebook</Link>}
            {shop.instagram_url && <Link href={shop.instagram_url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm">Instagram</Link>}
            {shop.whatsapp_url && <Link href={shop.whatsapp_url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm">WhatsApp</Link>}
            {shop.website_url && <Link href={shop.website_url} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm">Site web</Link>}
            {shopConfig.tiktokUrl && <Link href={shopConfig.tiktokUrl} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm">TikTok</Link>}
            {shopConfig.youtubeUrl && <Link href={shopConfig.youtubeUrl} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-2 text-sm">YouTube</Link>}
          </div>
        </AnimatedSection>
      )}

      {/* Produits */}
      {shop.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {shop.products.map((product, i) => (
            <AnimatedCard key={product.id} index={i}>
              <Link href={`/products/${product.id}`} className="group block">
                <div className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="relative overflow-hidden flex items-center justify-center"
                    style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <Package size={32} style={{ color: 'var(--subtle)' }} />
                    )}
                  </div>
                  <div className="p-4">
                    {product.category && (
                      <p className="text-xs mb-1 font-medium" style={{ color: 'var(--secondary)' }}>
                        {product.category.name}
                      </p>
                    )}
                    <p className="text-sm font-semibold mb-2 line-clamp-2"
                      style={{ color: 'var(--foreground)' }}>
                      {product.name}
                    </p>
                    {product.reviews.length > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star size={11} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                        <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                          {(product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length).toFixed(1)}
                        </span>
                      </div>
                    )}
                    <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('fr-FR').format(Number(product.price))}
                      <span className="text-xs font-normal ml-1"
                        style={{ color: 'var(--muted-foreground)' }}>FCFA</span>
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <div className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-4xl mb-4">📦</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Aucun produit disponible
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Cette boutique n&apos;a pas encore de produits en vente.
            </p>
          </div>
        </AnimatedSection>
      )}
      </div>
    </div>
  )
}