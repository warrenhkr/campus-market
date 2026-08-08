import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Package, ShoppingCart, Store, Plus, TrendingUp, Clock, CheckCircle, ArrowRight } from 'lucide-react'

async function getSellerData(userId: string) {
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

  const shopIds = seller.shops.map((shop) => shop.id)

  const recentOrders = await prisma.order.findMany({
    where: {
      order_items: {
        some: { product: { shop_id: { in: shopIds } } },
      },
    },
    include: {
      order_items: {
        include: { product: true },
      },
    },
    orderBy: { created_at: 'desc' },
    take: 5,
  }).catch(() => [])

  return {
    seller,
    totalProducts: allProducts.length,
    totalOrders: recentOrders.length,
    totalRevenue,
    recentOrders,
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
    { href: '/seller/products/new', label: 'Ajouter un produit', icon: Plus, color: '#8B5CF6' },
    { href: '/seller/products', label: 'Mes produits', icon: Package, color: '#3B82F6' },
    { href: '/seller/orders', label: 'Commandes', icon: ShoppingCart, color: '#F59E0B' },
    { href: '/seller/shop', label: 'Ma boutique', icon: Store, color: '#10B981' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      <AnimatedSection delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-1"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
              Dashboard vendeur 🏪
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {seller.shop_name} — Bienvenue sur ton espace vendeur
            </p>
          </div>
          <Button asChild>
            <Link href="/seller/products/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              <Plus size={16} />
              Ajouter un produit
            </Link>
          </Button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        {QUICK_LINKS.map(({ href, label, icon: Icon, color }, i) => (
          <AnimatedCard key={href} index={i} className="h-full">
            <Card className="h-full border-border bg-background shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="flex h-full flex-col justify-between gap-6 p-5">
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: `${color}20` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <p className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
                    {label}
                  </p>
                </div>
                <Link href={href} className="inline-flex items-center justify-center rounded-full border border-border bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  Aller
                </Link>
              </CardContent>
            </Card>
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
                      <div key={order.id} className="px-6 py-4">
                        <div className="flex items-center gap-4 rounded-lg p-3 transition-shadow hover:shadow-md"
                          style={{ background: 'transparent' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${status.color}18` }}>
                            <StatusIcon size={16} style={{ color: status.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                              {firstProduct?.name ?? 'Commande'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                              {new Intl.NumberFormat('fr-FR').format(Number(order.total_amount))} FCFA
                            </p>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ background: `${status.color}18`, color: status.color }}>
                              {status.label}
                            </span>
                          </div>
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