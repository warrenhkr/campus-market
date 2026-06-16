import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Store, Package, Star } from 'lucide-react'

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
          include: { reviews: true, category: true },
          orderBy: { created_at: 'desc' },
        },
      },
    })
  } catch {
    return null
  }
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const shop = await getShop(slug)
  if (!shop) notFound()

  const allReviews = shop.products.flatMap(p => p.reviews)
  const avgRating = allReviews.length > 0
    ? allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-2 mb-8 text-xs"
          style={{ color: 'var(--muted-foreground)' }}>
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[var(--foreground)] transition-colors">Produits</Link>
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
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
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
                      <p className="text-xs mb-1" style={{ color: 'var(--subtle)' }}>
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
  )
}