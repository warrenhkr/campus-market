import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { SearchIcon, GraduationCapIcon, UsersIcon } from '@/components/ServerIcons'

const GraduationCap = GraduationCapIcon
const Users = UsersIcon

interface SearchParams {
  search?: string
  category?: string
  university?: string
  filiere?: string
  scope?: 'my-university' | 'my-filiere'
}

async function getCurrentUserAcademics(userId: string | undefined) {
  if (!userId) return null
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { university: true, filiere: true },
    })
  } catch {
    return null
  }
}

async function getProducts(filters: SearchParams, academics: { university: string | null; filiere: string | null } | null) {
  try {
    const { search, category, university, filiere, scope } = filters

    // "scope" applique un raccourci basé sur le profil de l'utilisateur connecté
    // (repris du cahier des charges : "produits populaires dans ton campus" /
    // "produits vendus dans ta filière"), sans écraser un filtre explicite.
    const effectiveUniversity = scope === 'my-university' ? academics?.university ?? undefined : university
    const effectiveFiliere = scope === 'my-filiere' ? academics?.filiere ?? undefined : filiere

    return await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        is_available: true,
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(category ? { category_id: category } : {}),
        ...(effectiveUniversity ? { shop: { seller: { user: { university: effectiveUniversity } } } } : {}),
        ...(effectiveFiliere ? { shop: { seller: { user: { filiere: effectiveFiliere } } } } : {}),
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

// Listes dérivées du référentiel de l'onboarding pour peupler les filtres
// avec des valeurs cohérentes avec celles réellement choisies par les vendeurs.
async function getFilterOptions() {
  try {
    const [universities, filieres] = await Promise.all([
      prisma.user.findMany({
        where: { university: { not: null } },
        select: { university: true },
        distinct: ['university'],
        orderBy: { university: 'asc' },
      }),
      prisma.user.findMany({
        where: { filiere: { not: null } },
        select: { filiere: true },
        distinct: ['filiere'],
        orderBy: { filiere: 'asc' },
      }),
    ])
    return {
      universities: universities.map((u) => u.university).filter((u): u is string => !!u),
      filieres: filieres.map((f) => f.filiere).filter((f): f is string => !!f),
    }
  } catch {
    return { universities: [], filieres: [] }
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const { search, category, university, filiere, scope } = filters

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const academics = await getCurrentUserAcademics(user?.id)

  const [products, categories, filterOptions] = await Promise.all([
    getProducts(filters, academics),
    getCategories(),
    getFilterOptions(),
  ])

  const hasActiveFilters = !!(search || category || university || filiere || scope)

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
        <form method="GET" className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
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

          <select
            name="university"
            defaultValue={university}
            className="text-sm px-3 py-2 rounded-xl outline-none max-w-[220px]"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Toutes les universités</option>
            {filterOptions.universities.map((uni) => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>

          <select
            name="filiere"
            defaultValue={filiere}
            className="text-sm px-3 py-2 rounded-xl outline-none max-w-[220px]"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          >
            <option value="">Toutes les filières</option>
            {filterOptions.filieres.map((fil) => (
              <option key={fil} value={fil}>{fil}</option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold rounded-xl transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Filtrer
          </button>

          {hasActiveFilters && (
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

        {/* Raccourcis "campus" — repris du positionnement Campus Market : mettre
            en avant les produits de son propre entourage académique. */}
        {(academics?.university || academics?.filiere) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {academics.university && (
              <Link
                href={`/products?scope=my-university`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: scope === 'my-university' ? 'var(--primary)' : 'var(--primary-dim)',
                  color: scope === 'my-university' ? 'var(--primary-foreground)' : 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                }}
              >
                <GraduationCap size={12} />
                Produits populaires dans mon campus
              </Link>
            )}
            {academics.filiere && (
              <Link
                href={`/products?scope=my-filiere`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: scope === 'my-filiere' ? 'var(--primary)' : 'var(--primary-dim)',
                  color: scope === 'my-filiere' ? 'var(--primary-foreground)' : 'var(--primary)',
                  border: '1px solid var(--primary-border)',
                }}
              >
                <Users size={12} />
                Produits vendus dans ma filière
              </Link>
            )}
          </div>
        )}
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
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                        {product.category && (
                          <div
                            className="px-2 py-0.5 rounded-full text-xs font-medium"
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
                        <div
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: 'rgba(10,10,10,0.7)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--primary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {product.type === 'DIGITAL' ? 'Numérique' : 'Physique'}
                        </div>
                      </div>
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