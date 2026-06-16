import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Package, ShoppingCart, Store, Plus, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'

async function getSellerData(userId: string) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { user_id: userId },
      include: {
        shops: {
          include: {
            products: {
              include: { order_items: true },
            },
          },
        },
      },
    })

    if (!seller) return null

    const allProducts = seller.shops.flatMap(s => s.products)
    const allOrderItems = allProducts.flatMap(p => p.order_items)
    const totalRevenue = allOrderItems.reduce((acc, oi) => acc + Number(oi.price) * oi.quantity, 0)

    const recentOrders = await prisma.order.findMany({
      where: {
        order_items: {
          some: { product: { shop: { seller_id: seller.id } } },
        },
      },
      include: {
        order_items: {
          include: { product: true },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    })

    return {
      seller,
      totalProducts: allProducts.length,
      totalOrders: recentOrders.length,
      totalRevenue,
      recentOrders,
    }
  } catch {
    return null
  }
}

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: 'En attente',  color: '#F59E0B', icon: Clock },
  COMPLETED: { label: 'Complété',    color: '#10B981', icon: CheckCircle },
  CANCELLED: { label: 'Annulé',      color: '#F87171', icon: Clock },
  SHIPPED:   { label: 'Expédié',     color: '#3B82F6', icon: Package },
  DELIVERED: { label: 'Livré',       color: '#10B981', icon: CheckCircle },
}

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getSellerData(user.id)
  if (!data) redirect('/become-seller')

  const { seller, totalProducts, totalOrders, totalRevenue, recentOrders } = data

  const STATS = [
    { label: 'Produits', value: totalProducts, icon: Package, color: '#A3E635' },
    { label: 'Commandes', value: totalOrders, icon: ShoppingCart, color: '#3B82F6' },
    { label: 'Revenus', value: `${new Intl.NumberFormat('fr-FR').format(totalRevenue)} FCFA`, icon: TrendingUp, color: '#10B981' },
    { label: 'Boutiques', value: seller.shops.length, icon: Store, color: '#F59E0B' },
  ]

  const QUICK_LINKS = [
    { href: '/seller/products/new', label: 'Ajouter un produit', icon: Plus, color: '#A3E635' },
    { href: '/seller/products', label: 'Mes produits', icon: Package, color: '#3B82F6' },
    { href: '/seller/orders', label: 'Commandes', icon: ShoppingCart, color: '#F59E0B' },
    { href: '/seller/shop', label: 'Ma boutique', icon: Store, color: '#10B981' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <AnimatedSection delay={0}>
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold mb-1"
            style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            Dashboard vendeur 🏪
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {seller.shop_name} — Bienvenue sur ton espace vendeur
          </p>
        </div>
      </AnimatedSection>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STATS.map(({ label, value, icon: Icon, color }, i) => (
          <AnimatedCard key={label} index={i}>
            <div className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-2xl font-extrabold mb-0.5"
                style={{ color: 'var(--foreground)' }}>
                {value}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {label}
              </p>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {QUICK_LINKS.map(({ href, label, icon: Icon, color }, i) => (
          <AnimatedCard key={href} index={i}>
            <Link href={href} className="group block">
              <div className="rounded-2xl p-5 transition-all duration-200 hover:scale-105"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {label}
                </p>
              </div>
            </Link>
          </AnimatedCard>
        ))}
      </div>

      {/* Commandes récentes */}
      <AnimatedSection delay={0.2}>
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Commandes récentes
            </h2>
            <Link href="/seller/orders"
              className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-colors"
              style={{ color: 'var(--primary)' }}>
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {recentOrders.map((order) => {
                const status = ORDER_STATUS_MAP[order.status] ?? ORDER_STATUS_MAP.PENDING
                const StatusIcon = status.icon
                const firstProduct = order.order_items[0]?.product

                return (
                  <div key={order.id}
                    className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${status.color}18` }}>
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
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${status.color}18`, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Aucune commande pour l&apos;instant
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Ajoute des produits pour commencer à vendre.
              </p>
            </div>
          )}
        </div>
      </AnimatedSection>
    </div>
  )
}