import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'

interface SearchParams {
  search?: string
  category?: string
}

async function getProducts(search?: string, category?: string) {
  try {
    return await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        is_available: true,
        ...(search ? {
          name: { contains: search, mode: 'insensitive' }
        } : {}),
        ...(category ? { category_id: category } : {}),
      },
      include: { category: true, shop: true },
      orderBy: { created_at: 'desc' },
    })
  } catch {
    return []
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } })
  } catch {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { search, category } = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(search, category),
    getCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--primary)' }}>
            Catalogue
          </p>
          <h1 className="text-3xl font-bold"
            style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            Tous les produits
          </h1>
        </div>
      </AnimatedSection>

      {/* Filtres */}
      <AnimatedSection delay={0.1}>
        <form method="GET" className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--subtle)' }} />
            <input
              name="search"
              defaultValue={search}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          <select
            name="category"
            defaultValue={category}
            className="text-sm px-3 py-2 rounded-xl outline-none"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Filtrer
          </button>

          {(search ?? category) && (
            <Link
              href="/products"
              className="px-4 py-2 text-sm rounded-xl transition-all"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--muted-foreground)',
              }}
            >
              Réinitialiser
            </Link>
          )}
        </form>
      </AnimatedSection>

      {/* Résultats */}
      {products.length > 0 ? (
        <>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <AnimatedCard key={product.id} index={i}>
                <Link href={`/products/${product.id}`} className="group block">
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
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                      {product.category && (
                        <div
                          className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-medium z-10"
                          style={{
                            background: 'rgba(10,10,10,0.7)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--muted-foreground)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {product.category.name}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p
                        className="text-sm font-semibold mb-2 line-clamp-2"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {product.name}
                      </p>
                      {product.shop && (
                        <p className="text-xs mb-2" style={{ color: 'var(--subtle)' }}>
                          {product.shop.name}
                        </p>
                      )}
                      <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                        {new Intl.NumberFormat('fr-FR').format(Number(product.price))}
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
        </>
      ) : (
        <AnimatedSection>
          <div
            className="rounded-2xl p-20 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              Aucun produit trouvé
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {search ? `Aucun résultat pour "${search}"` : 'Aucun produit disponible pour le moment.'}
            </p>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}