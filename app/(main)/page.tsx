import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Shield, Users, ChevronRight } from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { prisma } from '@/lib/prisma'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  price: number | string
  image_url: string | null
  category: Category | null
}

async function getHomeData() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'APPROVED', is_available: true },
        include: { category: true },
        orderBy: { created_at: 'desc' },
        take: 8,
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ])
    return { products, categories }
  } catch {
    return { products: [] as Product[], categories: [] as Category[] }
  }
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: '🍔', Clothes: '👕', Tech: '💻',
  Books: '📚', Services: '🛠️', Sports: '⚽',
}

const STATIC_CATEGORIES: Category[] = [
  { id: '1', name: 'Food' },
  { id: '2', name: 'Clothes' },
  { id: '3', name: 'Tech' },
  { id: '4', name: 'Books' },
  { id: '5', name: 'Services' },
  { id: '6', name: 'Sports' },
]

export default async function HomePage() {
  const { products, categories } = await getHomeData()
  const displayCategories = categories.length > 0 ? categories : STATIC_CATEGORIES

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15"
            style={{ background: 'var(--primary)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-100 h-100 rounded-full blur-[120px] opacity-[0.08]"
            style={{ background: '#3B82F6' }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <AnimatedSection delay={0}>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <Zap size={11} fill="currentColor" />
              La marketplace des étudiants du Bénin
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <h1
              className="text-5xl md:text-7xl font-extrabold leading-none mb-6"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.04em' }}
            >
              Achète. Vends.{' '}
              <br />
              <span style={{ color: 'var(--primary)' }}>
                Sur ton campus.
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <p
              className="text-lg md:text-xl mb-10 max-w-xl leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Des livres aux gadgets tech, de la nourriture aux services —
              tout ce dont tu as besoin, vendu par tes camarades étudiants.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold
                  transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '0 0 30px rgba(163,230,53,0.25)',
                }}
              >
                Explorer les produits
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/become-seller"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold
                  transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                Devenir vendeur
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.45}>
            <div
              className="flex flex-wrap items-center gap-10 mt-16 pt-10"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {[
                { value: 500,  label: 'Étudiants actifs',  suffix: '+' },
                { value: 1200, label: 'Produits listés',   suffix: '+' },
                { value: 50,   label: 'Vendeurs vérifiés', suffix: '+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    className="text-3xl font-extrabold"
                    style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}
                  >
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--primary)' }}>
                Parcourir
              </p>
              <h2 className="text-3xl font-bold"
                style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                Toutes les catégories
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {displayCategories.map((cat, i) => (
              <AnimatedCard key={cat.id} index={i}>
                <Link
                  href={`/products?category=${cat.id}`}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl
                    transition-all duration-200 group hover:scale-105"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {CATEGORY_EMOJIS[cat.name] ?? '📦'}
                  </span>
                  <p className="text-xs font-semibold text-center"
                    style={{ color: 'var(--foreground)' }}>
                    {cat.name}
                  </p>
                </Link>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUITS RÉCENTS ── */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: 'var(--primary)' }}>
                  Nouveautés
                </p>
                <h2 className="text-3xl font-bold"
                  style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                  Produits récents
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-1 text-sm font-medium
                  transition-colors hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Voir tout <ChevronRight size={16} />
              </Link>
            </div>
          </AnimatedSection>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.slice(0, 4).map((product, i) => (
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
          ) : (
            <AnimatedSection>
              <div
                className="rounded-2xl p-16 text-center"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <p className="text-4xl mb-4">🛍️</p>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Aucun produit disponible pour le moment.
                </p>
                <Link
                  href="/become-seller"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                >
                  Devenir vendeur <ArrowRight size={14} />
                </Link>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* ── POURQUOI CAMPUS MARKET ── */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--primary)' }}>
              Pourquoi nous
            </p>
            <h2 className="text-3xl md:text-4xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Conçu pour les étudiants
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Sécurisé',       desc: 'Comptes étudiants vérifiés. Échangez en toute confiance.' },
              { icon: Zap,    title: 'Rapide & Simple', desc: 'Mettez en vente en quelques minutes. Zéro friction.' },
              { icon: Users,  title: 'Communauté',      desc: "Achetez et vendez avec vos camarades de campus." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <AnimatedCard key={title} index={i}>
                <div
                  className="rounded-2xl p-8 h-full"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background: 'var(--primary-dim)',
                      border: '1px solid var(--primary-border)',
                    }}
                  >
                    <Icon size={22} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2"
                    style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {desc}
                  </p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div
              className="relative rounded-3xl p-10 md:p-16 overflow-hidden text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--primary-border)',
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24
                  blur-[80px] opacity-25 pointer-events-none"
                style={{ background: 'var(--primary)' }}
              />
              <div className="relative">
                <h2
                  className="text-3xl md:text-5xl font-extrabold mb-4"
                  style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}
                >
                  Prêt à vendre sur ton campus ?
                </h2>
                <p className="text-base mb-8 max-w-lg mx-auto"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Rejoins des centaines d&apos;étudiants qui monétisent leurs produits et services.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/become-seller"
                    className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold
                      transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      boxShadow: '0 0 30px rgba(163,230,53,0.2)',
                    }}
                  >
                    Devenir vendeur <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/register"
                    className="px-7 py-3.5 rounded-xl text-sm font-semibold
                      transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Créer un compte
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: 'var(--primary)' }}
              >
                <span style={{
                  fontSize: '10px',
                  color: 'var(--primary-foreground)',
                  fontWeight: 700,
                }}>
                  CM
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                Campus Market
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--subtle)' }}>
              © {new Date().getFullYear()} Campus Market. Tous droits réservés.
            </p>
            <div className="flex items-center gap-5">
              {[
                { href: '/products',      label: 'Produits' },
                { href: '/become-seller', label: 'Vendeurs' },
                { href: '/login',         label: 'Connexion' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs transition-colors hover:opacity-100 opacity-50"
                  style={{ color: 'var(--foreground)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}