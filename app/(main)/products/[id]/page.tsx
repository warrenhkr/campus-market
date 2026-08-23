import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { ProductPurchaseOptions } from '@/components/ProductPurchaseOptions'
import { ProductSalesActions, type ProductSalesActionsProps } from '@/components/ProductSalesActions'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ProductPromoCard } from '../../../../components/ProductPromoCard'
import {
  ArrowLeft, Store, Package, Star,
  ShoppingCart, CheckCircle,
} from '@/components/ServerIcons'
import { ShareButton } from '@/components/ShareButton'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { ProductReviews } from '@/components/ProductReviews'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

type SalesPageSectionType = 'hero' | 'text' | 'feature_list' | 'faq' | 'cta'

interface SectionItem {
  title?: string
  description?: string
  question?: string
  answer?: string
  [key: string]: unknown
}

type SectionContent = {
  headline?: string
  subheadline?: string
  imageUrl?: string
  ctaText?: string
  ctaUrl?: string
  ctaColor?: string
  buttonText?: string
  buttonUrl?: string
  title?: string
  body?: string
  items?: Array<SectionItem>
}

interface ProductSalesPageSection {
  id?: string
  type: SalesPageSectionType
  isVisible?: boolean
  content: SectionContent
}

interface ProductMetadata {
  autoDiscount?: {
    enabled?: boolean
    type?: 'FIXED' | 'PERCENT'
    value?: number | string | null
  }
  availability?: {
    scope?: 'PARTOUT' | 'MON_UNIVERSITE' | 'AUTRES_UNIVERSITES' | 'HORS_UNIVERSITE'
    note?: string | null
  }
  visibility?: {
    showStock?: boolean
    showRelatedProducts?: boolean
  }
  seo?: {
    ogTitle?: string | null
    ogDescription?: string | null
    ogImage?: string | null
  }
  pickup?: {
    available?: boolean
    location?: string | null
  }
  gallery?: Array<string | null | undefined>
  salesPage?: {
    ctaColor?: string
    hero?: {
      headline?: string
      subheadline?: string
      imageUrl?: string
      ctaText?: string
      ctaUrl?: string
    }
    body?: string
    sections?: ProductSalesPageSection[]
  }
  delivery?: Record<string, unknown>
}

function getSectionItems(content: SectionContent): SectionItem[] {
  const items = content.items
  return Array.isArray(items) ? items : []
}

function renderSalesPageSection(section: ProductSalesPageSection, purchaseProduct: ProductSalesActionsProps['product']) {
  const { type, content } = section
  const sectionItems = getSectionItems(content)
  switch (type) {
    case 'hero':
      return (
        <div className="rounded-3xl overflow-hidden border border-border bg-[var(--surface)]">
          {content.imageUrl ? (
            <div className="relative h-72 sm:h-96">
              <Image src={content.imageUrl} alt={content.headline ?? 'Hero'} fill className="object-cover" />
            </div>
          ) : null}
          <div className="p-8">
            <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--foreground)' }}>
              {content.headline ?? 'Titre de la section'}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground mb-5">
              {content.subheadline ?? 'Sous-titre de présentation.'}
            </p>
            <ProductSalesActions product={purchaseProduct} label={content.ctaText ?? 'Acheter maintenant'} color={content.ctaColor} />
          </div>
        </div>
      )

    case 'text':
      return (
        <div className="rounded-3xl border border-border bg-[var(--surface)] p-8">
          <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--foreground)' }}>
            {content.title ?? 'Titre de section'}
          </h3>
          <p className="text-sm leading-7 text-muted-foreground">
            {content.body ?? 'Contenu de section.'}
          </p>
        </div>
      )

    case 'feature_list':
      return (
        <div className="rounded-3xl border border-border bg-[var(--surface)] p-8">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            {content.title ?? 'Ce que ton produit apporte'}
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {sectionItems.map((item, index) => (
              <div key={index} className="rounded-3xl border border-border bg-[var(--surface-2)] p-5">
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{item.title ?? `Avantage ${index + 1}`}</p>
                <p className="text-sm text-muted-foreground">{item.description ?? 'Description du bénéfice.'}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'faq':
      return (
        <div className="rounded-3xl border border-border bg-[var(--surface)] p-8">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            {content.title ?? 'Foire aux questions'}
          </h3>
          <div className="space-y-4">
            {sectionItems.map((item, index) => (
              <div key={index} className="rounded-3xl border border-border bg-[var(--surface-2)] p-5">
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{item.question ?? `Question ${index + 1}`}</p>
                <p className="text-sm text-muted-foreground">{item.answer ?? 'Réponse à la question.'}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case 'cta':
      return (
        <div className="rounded-3xl border border-border bg-primary p-8 text-primary-foreground">
          <h3 className="text-2xl font-bold mb-3">{content.headline ?? 'Prêt à agir ?'}</h3>
          {content.buttonText ? (
              <ProductSalesActions product={purchaseProduct} label={content.buttonText ?? 'Acheter maintenant'} />
          ) : null}
        </div>
      )

    default:
      return null
  }
}

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        shop: {
          include: {
            seller: {
              include: { user: { select: { name: true, email: true, university: true } } }
            },
            products: {
              where: { status: 'APPROVED', is_available: true },
              take: 4,
              orderBy: { created_at: 'desc' },
            },
          },
        },
        reviews: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { created_at: 'desc' },
        },
        pricing_tiers: { orderBy: { position: 'asc' } },
          variants: { where: { is_active: true }, orderBy: { position: 'asc' } },
        delivery_zones: { where: { is_active: true }, orderBy: { position: 'asc' } },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Produit introuvable | Campus Market' }

  const metadata = (product.metadata ?? {}) as ProductMetadata
  const title = product.seo_title?.trim() || product.name
  const description = product.seo_description?.trim() || product.description?.slice(0, 160) || `Découvrez ${product.name} sur Campus Market.`
  const image = product.seo_thumbnail_url || metadata.seo?.ogImage || product.image_url || undefined

  return {
    title,
    description,
    keywords: product.seo_keywords?.split(',').map((keyword) => keyword.trim()).filter(Boolean),
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      title: metadata.seo?.ogTitle?.trim() || title,
      description: metadata.seo?.ogDescription?.trim() || description,
      type: 'website',
      url: `/products/${product.id}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: metadata.seo?.ogTitle?.trim() || title,
      description: metadata.seo?.ogDescription?.trim() || description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const metadata = (product.metadata ?? {}) as ProductMetadata
  const availabilityScope = metadata.availability?.scope ?? 'PARTOUT'
  const autoDiscount = metadata.autoDiscount
  const autoDiscountConfig = autoDiscount?.enabled && autoDiscount.value != null
    ? {
        enabled: true,
        type: autoDiscount.type ?? 'FIXED',
        value: Number(autoDiscount.value),
      }
    : null
  const showStockField = metadata.visibility?.showStock ?? true
  const salesPageHero = metadata.salesPage?.hero
  const salesPageBody = typeof metadata.salesPage?.body === 'string' ? metadata.salesPage.body : ''
  const salesPageSections = Array.isArray(metadata.salesPage?.sections)
    ? metadata.salesPage.sections.filter((section) => section.isVisible !== false)
    : []
  const availabilityNote = metadata.availability?.note ?? ''
  const delivery = metadata.delivery as { enabled?: boolean; fee?: number | string | null; freeThreshold?: number | string | null } | undefined
  const hasDeliveryInformation = Boolean(
    metadata.pickup?.available || delivery?.enabled || product.delivery_zones.length > 0
  )

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  // null = non connecté ; sinon true seulement si l'utilisateur n'a pas déjà noté ce produit
  const canReview = user ? !product.reviews.some((review) => review.user_id === user.id) : null

  const buyer = user
    ? await prisma.user.findUnique({ select: { university: true }, where: { id: user.id } })
    : null
  const sellerUniversity = product.shop?.seller?.user?.university ?? null
  const canBuyByUniversity = availabilityScope === 'PARTOUT'
    || (availabilityScope === 'MON_UNIVERSITE' && Boolean(buyer?.university) && buyer?.university === sellerUniversity)
    || (availabilityScope === 'HORS_UNIVERSITE' && !buyer?.university)
    || (availabilityScope === 'AUTRES_UNIVERSITES' && Boolean(buyer?.university) && Boolean(sellerUniversity) && buyer?.university !== sellerUniversity)
  const universityAccessMessage = !canBuyByUniversity
      ? availabilityScope === 'MON_UNIVERSITE'
        ? 'Ce produit est réservé aux étudiants de l’université du vendeur.'
        : availabilityScope === 'AUTRES_UNIVERSITES'
          ? 'Ce produit est réservé aux étudiants d’une autre université.'
          : 'Ce produit est réservé aux acheteurs hors université.'
    : null

  const otherProducts = product.shop?.products.filter(p => p.id !== product.id) ?? []
  const purchaseProduct: ProductSalesActionsProps['product'] = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image_url: product.image_url,
    stock: product.stock,
    stock_mode: product.stock_mode,
    shop_id: product.shop?.id ?? '',
    shop_name: product.shop?.name ?? '',
    shop_slug: product.shop?.slug ?? '',
    type: product.type,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-2 mb-8 text-xs"
          style={{ color: 'var(--muted-foreground)' }}>
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--foreground)] transition-colors">
            Produits
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.id}`}
                className="hover:text-[var(--foreground)] transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--foreground)' }} className="truncate max-w-[150px]">
            {product.name}
          </span>
        </div>
      </AnimatedSection>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

        {/* Image */}
        <AnimatedSection delay={0.1} direction="left">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              aspectRatio: '1/1',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">📦</span>
              </div>
            )}

            {product.stock_mode === 'TRACKED' && product.stock <= 5 && product.stock > 0 && (
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#F59E0B', color: '#0A0A0A' }}
              >
                Plus que {product.stock} en stock !
              </div>
            )}
            {(product.stock_mode === 'OUT_OF_STOCK' || (product.stock_mode === 'TRACKED' && product.stock === 0)) && (
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#F87171', color: '#0A0A0A' }}
              >
                Rupture de stock
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* Info */}
        <AnimatedSection delay={0.15} direction="right">
          <div className="flex flex-col h-full">

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <Link
                  href={`/products?category=${product.category.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold w-fit px-3 py-1 rounded-full transition-all hover:opacity-80"
                  style={{
                    background: 'var(--primary-dim)',
                    border: '1px solid var(--primary-border)',
                    color: 'var(--primary)',
                  }}
                >
                  <Package size={11} />
                  {product.category.name}
                </Link>
              )}
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                {product.type === 'DIGITAL' ? 'Produit numérique' : 'Produit physique'}
              </span>
            </div>

            <h1
              className="text-2xl md:text-3xl font-extrabold mb-3"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}
            >
              {product.name}
            </h1>

            {product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.round(avgRating) ? '#F59E0B' : 'none'}
                      style={{ color: '#F59E0B' }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {avgRating.toFixed(1)} ({product.reviews.length} avis)
                </span>
              </div>
            )}

            <ProductPromoCard
              price={Number(product.price)}
              originalPrice={product.original_price ? Number(product.original_price) : null}
              promoLabel={product.promo_label ?? undefined}
              promoEndAt={product.promo_end_at ? product.promo_end_at.toISOString() : undefined}
              ctaText={product.cta_text ?? undefined}
              ctaUrl={product.cta_url ?? undefined}
              ctaStyle={product.cta_style ?? 'PRIMARY'}
            />

            {product.description && (
              <div className="mb-6 prose max-w-full prose-sm prose-headings:text-base prose-p:text-sm prose-a:text-primary prose-img:rounded-3xl prose-img:max-w-full"
                style={{ color: 'var(--muted-foreground)' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, [rehypeSanitize, {
                    ...defaultSchema,
                    tagNames: [...(defaultSchema.tagNames ?? []), 'video', 'source'],
                    attributes: {
                      ...defaultSchema.attributes,
                      video: [...((defaultSchema.attributes?.video as string[]) ?? []), 'src', 'class', 'controls', 'width', 'height', 'poster', 'preload'],
                      source: [...((defaultSchema.attributes?.source as string[]) ?? []), 'src', 'type'],
                    },
                  }]]}
                >
                  {product.description}
                </ReactMarkdown>
              </div>
            )}

            {availabilityNote ? (
              <div className="mb-6 rounded-3xl border border-border bg-[var(--surface)] p-5 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Disponibilité</p>
                <p>{availabilityNote}</p>
              </div>
            ) : null}

            {hasDeliveryInformation ? (
              <div className="mb-6 rounded-3xl border border-border bg-[var(--surface)] p-5 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Livraison et retrait</p>
                <div className="mt-3 space-y-2">
                  {metadata.pickup?.available ? (
                    <p>Retrait sur place{metadata.pickup.location ? ` : ${metadata.pickup.location}` : ''}</p>
                  ) : null}
                  {delivery?.enabled ? (
                    <p>
                      Livraison disponible{delivery.fee != null ? ` à partir de ${new Intl.NumberFormat('fr-FR').format(Number(delivery.fee))} FCFA` : ''}
                      {delivery.freeThreshold != null ? `, gratuite dès ${new Intl.NumberFormat('fr-FR').format(Number(delivery.freeThreshold))} FCFA` : ''}.
                    </p>
                  ) : null}
                  {product.delivery_zones.map((zone) => (
                    <p key={zone.id}>
                      {zone.name}{zone.fee != null ? ` : ${new Intl.NumberFormat('fr-FR').format(Number(zone.fee))} FCFA` : ' : gratuit'}
                      {zone.estimated_min_days != null ? `, ${zone.estimated_min_days}${zone.estimated_max_days != null ? `-${zone.estimated_max_days}` : ''} jour${zone.estimated_max_days === 1 ? '' : 's'}` : ''}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}

            {(salesPageHero || salesPageBody) ? (
              <div className="mb-6 space-y-6">
                {salesPageHero ? (
                  <div className="rounded-3xl overflow-hidden border border-border bg-[var(--surface)]">
                    {salesPageHero.imageUrl ? (
                      <div className="relative h-72 sm:h-96">
                        <Image src={salesPageHero.imageUrl} alt={salesPageHero.headline ?? 'Hero'} fill className="object-cover" />
                      </div>
                    ) : null}
                    <div className="p-8">
                      <h2 className="text-3xl font-extrabold mb-3" style={{ color: 'var(--foreground)' }}>
                        {salesPageHero.headline ?? 'Titre de la page de vente'}
                      </h2>
                      <p className="text-sm leading-7 text-muted-foreground mb-5">
                        {salesPageHero.subheadline ?? 'Sous-titre de présentation.'}
                      </p>
                      <ProductSalesActions product={purchaseProduct} label={salesPageHero.ctaText ?? 'Acheter maintenant'} color={metadata.salesPage?.ctaColor} />
                    </div>
                  </div>
                ) : null}
                {salesPageBody ? (
                  <div className="rounded-3xl border border-border bg-[var(--surface)] p-8 prose max-w-full prose-sm prose-headings:text-base prose-a:text-primary prose-img:rounded-3xl prose-img:max-w-full">
                    <RichTextRenderer value={salesPageBody} />
                  </div>
                ) : null}
              </div>
            ) : null}
            {salesPageSections.length > 0 ? (
              <div className="mb-6 space-y-6">
                {salesPageSections.map((section, index) => (
                  <div key={`${section.id ?? index}-${section.type}`}>
                    {renderSalesPageSection(section, purchaseProduct)}
                  </div>
                ))}
              </div>
            ) : null}

            {showStockField && (
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle size={14} style={{
                  color: product.stock_mode === 'OUT_OF_STOCK' || (product.stock_mode === 'TRACKED' && product.stock <= 0) ? 'var(--destructive)' : 'var(--success)'
                }} />
                <span className="text-xs font-medium" style={{
                  color: product.stock_mode === 'OUT_OF_STOCK' || (product.stock_mode === 'TRACKED' && product.stock <= 0) ? 'var(--destructive)' : 'var(--success)'
                }}>
                  {product.stock_mode === 'UNLIMITED'
                    ? 'Disponible sans limite'
                    : product.stock_mode === 'PREORDER'
                      ? 'Disponible en précommande'
                      : product.stock_mode === 'OUT_OF_STOCK' || product.stock <= 0
                        ? 'Rupture de stock'
                        : `${product.stock} disponible${product.stock > 1 ? 's' : ''}`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              {user ? (
                <ProductPurchaseOptions
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image_url: product.image_url,
                    stock: product.stock,
                    stock_mode: product.stock_mode,
                    shop_id: product.shop?.id ?? '',
                    shop_name: product.shop?.name ?? '',
                    shop_slug: product.shop?.slug ?? '',
                    type: product.type,
                    auto_discount: autoDiscountConfig,
                  }}
                  pricingTiers={product.pricing_tiers.map((tier) => ({
                    id: tier.id,
                    label: tier.label,
                    price: Number(tier.price),
                    is_default: tier.is_default,
                  }))}
                  variants={product.variants.map((variant) => ({
                    id: variant.id,
                    name: variant.name,
                    price_delta: Number(variant.price_delta),
                    stock_delta: variant.stock_delta,
                    is_active: variant.is_active,
                  }))}
                  canPurchase={canBuyByUniversity}
                  accessMessage={universityAccessMessage}
                />
              ) : (
                <Link
                  href="/login"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
                    text-sm font-bold transition-all hover:scale-105"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  <ShoppingCart size={16} />
                  Se connecter pour acheter
                </Link>
              )}

              <FavoriteButton
                productId={product.id}
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
              />

              {/* Share button is a client component to avoid passing handlers from server */}
              <ShareButton productId={product.id} />
            </div>

            {/* Vendeur */}
            {product.shop && (
              <Link
                href={`/shop/${product.shop.slug}`}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}
                >
                  <Store size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate"
                    style={{ color: 'var(--foreground)' }}>
                    {product.shop.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {product.shop.products.length} produit{product.shop.products.length > 1 ? 's' : ''} en vente
                  </p>
                  {product.shop?.seller?.user?.name && (
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      Vendu par {product.shop.seller.user.name}{product.shop.seller.user.university ? ` — Université : ${product.shop.seller.user.university}` : ''}
                    </p>
                  )}
                </div>
                <ArrowLeft size={14} className="ml-auto rotate-180 flex-shrink-0"
                  style={{ color: 'var(--muted-foreground)' }} />
              </Link>
            )}
          </div>
        </AnimatedSection>
      </div>

      {/* Avis */}
      <ProductReviews
        productId={product.id}
        initialReviews={product.reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          is_verified_purchase: review.is_verified_purchase,
          seller_reply: review.seller_reply,
          seller_reply_at: review.seller_reply_at ? review.seller_reply_at.toISOString() : null,
          created_at: review.created_at.toISOString(),
          user: review.user,
        }))}
        canReview={canReview}
      />


      {/* Autres produits de la boutique */}
      {otherProducts.length > 0 && (
        <AnimatedSection delay={0.25}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold"
                style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                Autres produits de {product.shop?.name}
              </h2>
              <Link
                href={`/shop/${product.shop?.slug}`}
                className="text-xs font-medium transition-colors hover:opacity-70"
                style={{ color: 'var(--primary)' }}
              >
                Voir la boutique →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {otherProducts.map((p, i) => (
                <AnimatedCard key={p.id} index={i}>
                  <Link href={`/products/${p.id}`} className="group block">
                    <div
                      className="rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="relative overflow-hidden flex items-center justify-center"
                        style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}
                      >
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-3xl">📦</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold mb-2 line-clamp-2"
                          style={{ color: 'var(--foreground)' }}>
                          {p.name}
                        </p>
                        <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                          {new Intl.NumberFormat('fr-FR').format(Number(p.price))}
                          <span className="text-xs font-normal ml-1"
                            style={{ color: 'var(--muted-foreground)' }}>
                            FCFA
                          </span>
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
    </div>
  )
}