import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Store, Package, Edit, ArrowRight, Star } from 'lucide-react'

async function getSellerShop(userId: string) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { user_id: userId },
      include: {
        shops: {
          include: {
            products: {
              where: { status: 'APPROVED', is_available: true },
              include: { reviews: true },
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
    })
    return seller
  } catch {
    return null
  }
}

export default async function SellerShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const seller = await getSellerShop(user.id)
  if (!seller) redirect('/become-seller')

  const shop = seller.shops[0]

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

  const totalReviews = shop.products.flatMap(p => p.reviews)
  const avgRating = totalReviews.length > 0
    ? totalReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews.length
    : 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header boutique */}
      <AnimatedSection delay={0}>
        <div className="rounded-3xl p-8 mb-8 relative overflow-hidden"
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
                {totalReviews.length > 0 && (
                  <span className="flex items-center gap-1 text-xs"
                    style={{ color: 'var(--muted-foreground)' }}>
                    <Star size={12} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                    {avgRating.toFixed(1)} ({totalReviews.length} avis)
                  </span>
                )}
                <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                  /{shop.slug}
                </span>
              </div>
            </div>

            <Link href={`/shop/${shop.slug}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                transition-all hover:scale-105 flex-shrink-0"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              Voir la boutique <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* Produits */}
      <AnimatedSection delay={0.1}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            Produits en vente
          </h2>
          <Link href="/seller/products/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
              transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            + Ajouter
          </Link>
        </div>

        {shop.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {shop.products.map((product, i) => (
              <AnimatedCard key={product.id} index={i}>
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="relative overflow-hidden flex items-center justify-center"
                    style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}>
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name}
                        fill className="object-cover" />
                    ) : (
                      <span className="text-4xl">📦</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold mb-1 line-clamp-1"
                      style={{ color: 'var(--foreground)' }}>
                      {product.name}
                    </p>
                    <p className="text-base font-bold mb-3" style={{ color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('fr-FR').format(Number(product.price))} FCFA
                    </p>
                    <div className="flex items-center gap-2">
                      <Link href={`/products/${product.id}`}
                        className="flex-1 flex items-center justify-center py-2 rounded-lg
                          text-xs font-medium transition-all hover:scale-105"
                        style={{ background: 'var(--surface-2)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                        Voir
                      </Link>
                      <Link href={`/seller/products/${product.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                          transition-all hover:scale-105"
                        style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}>
                        <Edit size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
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