import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { TypewriterText } from '@/components/TypewriterText'
import {
  ShoppingCart, Heart, Package, ArrowRight,
  Star, Clock, CheckCircle,
} from 'lucide-react'

async function getUserData(userId: string) {
  try {
    const [user, orders, favorites] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, role: true, created_at: true },
      }),
      prisma.order.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: {
          order_items: {
            include: { product: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({
        where: { status: 'APPROVED', is_available: true },
      }),
    ])
    return { user, orders, productCount: favorites }
  } catch {
    return { user: null, orders: [], productCount: 0 }
  }
}

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: 'En attente',  color: '#F59E0B', icon: Clock },
  SHIPPED:   { label: 'Expédié',     color: '#3B82F6', icon: Package },
  DELIVERED: { label: 'Livré',       color: '#10B981', icon: CheckCircle },
  CANCELLED: { label: 'Annulé',      color: '#F87171', icon: Clock },
  COMPLETED: { label: 'Complété',    color: '#10B981', icon: CheckCircle },
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { user: profile, orders, productCount } = await getUserData(user.id)

  const firstName = profile?.name?.split(' ')[0] ?? profile?.email?.split('@')[0] ?? 'toi'

  const QUICK_LINKS = [
    {
      href: '/account/orders',
      icon: ShoppingCart,
      label: 'Mes commandes',
      desc: `${orders.length} commande${orders.length > 1 ? 's' : ''}`,
      color: '#3B82F6',
    },
    {
      href: '/account/cart',
      icon: Heart,
      label: 'Mon panier',
      desc: 'Articles sauvegardés',
      color: '#F87171',
    },
    {
      href: '/products',
      icon: Package,
      label: 'Explorer',
      desc: `${productCount}+ produits`,
      color: '#A3E635',
    },
    {
      href: '/account/profile',
      icon: Star,
      label: 'Mon profil',
      desc: 'Gérer mes infos',
      color: '#F59E0B',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Salutation personnalisée */}
      <AnimatedSection delay={0}>
        <div className="mb-10">
          <h1
            className="text-3xl md:text-4xl font-extrabold mb-2"
            style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}
          >
            <TypewriterText text={`Bonjour, ${firstName} 👋`} />
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Bienvenue sur ton espace personnel Campus Market.
          </p>
        </div>
      </AnimatedSection>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc, color }, i) => (
          <AnimatedCard key={href} index={i}>
            <Link href={href} className="group block">
              <div
                className="rounded-2xl p-5 transition-all duration-200 hover:scale-105"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-sm font-semibold mb-0.5"
                  style={{ color: 'var(--foreground)' }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {desc}
                </p>
              </div>
            </Link>
          </AnimatedCard>
        ))}
      </div>

      {/* Commandes récentes */}
      <AnimatedSection delay={0.2}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Commandes récentes
            </h2>
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {orders.map((order) => {
                const status = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.PENDING
                const StatusIcon = status.icon
                const firstProduct = order.order_items[0]?.product

                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${status.color}18` }}
                    >
                      <StatusIcon size={16} style={{ color: status.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate"
                        style={{ color: 'var(--foreground)' }}>
                        {firstProduct?.name ?? 'Commande'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                        {new Intl.NumberFormat('fr-FR').format(Number(order.total_amount))} FCFA
                      </p>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: `${status.color}18`,
                          color: status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-3xl mb-3">🛒</p>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Aucune commande pour l&apos;instant
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                {firstName}, explore le catalogue et passe ta première commande !
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                Explorer les produits <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Devenir vendeur CTA */}
      {profile?.role === 'USER' && (
        <AnimatedSection delay={0.3}>
          <div
            className="mt-6 rounded-2xl p-6 flex items-center justify-between gap-4"
            style={{
              background: 'var(--primary-dim)',
              border: '1px solid var(--primary-border)',
            }}
          >
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                Tu veux vendre sur Campus Market ?
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Ouvre ta boutique en quelques minutes et commence à gagner de l&apos;argent.
              </p>
            </div>
            <Link
              href="/become-seller"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Commencer <ArrowRight size={12} />
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}