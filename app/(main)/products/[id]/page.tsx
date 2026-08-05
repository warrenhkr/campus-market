import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { AddToCartButton } from '@/components/AddToCartButton'
import { FavoriteButton } from '@/components/FavoriteButton'
import {
  ArrowLeft, Store, Package, Star,
  ShoppingCart, Share2, CheckCircle,
} from 'lucide-react'

async function getProduct(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        shop: {
          include: {
            seller: {
              include: { user: { select: { name: true, email: true } } }
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
          take: 5,
        },
      },
    })
  } catch {
    return null
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

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0

  const otherProducts = product.shop?.products.filter(p => p.id !== product.id) ?? []

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

            {product.stock <= 5 && product.stock > 0 && (
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#F59E0B', color: '#0A0A0A' }}
              >
                Plus que {product.stock} en stock !
              </div>
            )}
            {product.stock === 0 && (
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

            {product.category && (
              <Link
                href={`/products?category=${product.category.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3
                  w-fit px-3 py-1 rounded-full transition-all hover:opacity-80"
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

            <div className="mb-6">
              <p
                className="text-4xl font-extrabold"
                style={{ color: 'var(--primary)', letterSpacing: '-0.03em' }}
              >
                {new Intl.NumberFormat('fr-FR').format(Number(product.price))}
                <span className="text-lg font-normal ml-2"
                  style={{ color: 'var(--muted-foreground)' }}>
                  FCFA
                </span>
              </p>
            </div>

            {product.description && (
              <div className="mb-6">
                <p className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {product.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6">
              <CheckCircle size={14} style={{
                color: product.stock > 0 ? 'var(--success)' : 'var(--destructive)'
              }} />
              <span className="text-xs font-medium" style={{
                color: product.stock > 0 ? 'var(--success)' : 'var(--destructive)'
              }}>
                {product.stock > 0
                  ? `${product.stock} disponible${product.stock > 1 ? 's' : ''}`
                  : 'Rupture de stock'
                }
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              {user ? (
                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image_url: product.image_url,
                    stock: product.stock,
                    shop_name: product.shop?.name ?? '',
                    shop_slug: product.shop?.slug ?? '',
                  }}
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

              <button
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all
                  hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--muted-foreground)',
                }}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
              >
                <Share2 size={18} />
              </button>
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
                </div>
                <ArrowLeft size={14} className="ml-auto rotate-180 flex-shrink-0"
                  style={{ color: 'var(--muted-foreground)' }} />
              </Link>
            )}
          </div>
        </AnimatedSection>
      </div>

      {/* Avis */}
      {product.reviews.length > 0 && (
        <AnimatedSection delay={0.2}>
          <div className="mb-16">
            <h2 className="text-xl font-bold mb-6"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Avis clients ({product.reviews.length})
            </h2>
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                    >
                      {(review.user.name ?? review.user.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                        {review.user.name ?? review.user.email.split('@')[0]}
                      </p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < review.rating ? '#F59E0B' : 'none'}
                            style={{ color: '#F59E0B' }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs" style={{ color: 'var(--subtle)' }}>
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

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