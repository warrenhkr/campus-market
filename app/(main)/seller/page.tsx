import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { PackageIcon, ShoppingCartIcon, StoreIcon, PlusIcon, TrendingUpIcon, ClockIcon, CheckCircleIcon, ArrowRightIcon, AlertTriangleIcon } from '@/components/ServerIcons'

async function getSellerData(userId: string) {
  const seller = await prisma.seller.findUnique({
    where: { user_id: userId },
    include: {
      shops: {
        include: {
          products: true,
        },
      },
    },
  })

  if (!seller) return null

  const allProducts = seller.shops.flatMap(s => s.products)
  const shopIds = seller.shops.map((shop) => shop.id)

  // Le vrai gain du vendeur (après commission plateforme, déjà figé par
  // boutique au moment de chaque paiement confirmé) — pas le chiffre
  // d'affaires brut, qui inclut la part reversée à la plateforme.
  const capturedSplits = (await prisma.paymentSplit.findMany({
    where: { shop_id: { in: shopIds }, payment: { status: 'CAPTURED' } },
    select: { seller_earning: true },
  }).catch(() => [] as Array<{ seller_earning: number | string | { toNumber: () => number } }>)) as Array<{ seller_earning: number | string | { toNumber: () => number } }>
  const totalEarnings = capturedSplits.reduce<number>((acc, split) => acc + Number(split.seller_earning), 0)

  const totalOrdersCount = await prisma.order.count({
    where: { order_items: { some: { product: { shop_id: { in: shopIds } } } } },
  }).catch(() => 0)

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

  // Produits dont le stock passe sous leur propre seuil d'alerte — configuré
  // par le vendeur dans la fiche produit (onglet Stock).
  const lowStockProducts = allProducts.filter(
    (product) =>
      product.stock_mode === 'TRACKED' &&
      product.low_stock_threshold != null &&
      product.stock <= product.low_stock_threshold
  )

  return {
    seller,
    totalProducts: allProducts.length,
    totalOrders: totalOrdersCount,
    totalEarnings,
    recentOrders,
    lowStockProducts,
  }
}

const ORDER_STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: 'En attente',  color: '#F59E0B', icon: ClockIcon },
  COMPLETED: { label: 'Complété',    color: '#10B981', icon: CheckCircleIcon },
  CANCELLED: { label: 'Annulé',      color: '#F87171', icon: ClockIcon },
  SHIPPED:   { label: 'Expédié',     color: '#3B82F6', icon: PackageIcon },
  DELIVERED: { label: 'Livré',       color: '#10B981', icon: CheckCircleIcon },
}

export default async function SellerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getSellerData(user.id)
  if (!data) redirect('/become-seller')

  // Spacer for mobile bottom nav
  const MobileSpacer = () => <div className="h-24 md:hidden" />

  const { seller, totalProducts, totalOrders, totalEarnings, recentOrders, lowStockProducts } = data

  const STATS = [
    { label: 'Produits', value: totalProducts, icon: PackageIcon, color: '#A3E635' },
    { label: 'Commandes', value: totalOrders, icon: ShoppingCartIcon, color: '#3B82F6' },
    { label: 'Mes gains', value: `${new Intl.NumberFormat('fr-FR').format(totalEarnings)} FCFA`, icon: TrendingUpIcon, color: '#10B981' },
    { label: 'Boutiques', value: seller.shops.length, icon: StoreIcon, color: '#F59E0B' },
  ]

  return (
    <div className="w-full px-4 pb-12 pt-4 sm:px-6 lg:px-8 md:pt-5">

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
              <PlusIcon size={16} />
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

      {/* Alerte stock bas — n'apparaît que si au moins un produit suivi passe
          sous son seuil d'alerte configuré (remplace les raccourcis vers les
          pages déjà accessibles en permanence depuis la barre de navigation). */}
      {lowStockProducts.length > 0 && (
        <AnimatedSection delay={0.15}>
          <Link
            href="/seller/products"
            className="mb-10 flex items-center gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
            style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <AlertTriangleIcon size={18} style={{ color: '#F59E0B' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {lowStockProducts.length} produit{lowStockProducts.length > 1 ? 's' : ''} en stock bas
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {lowStockProducts.slice(0, 3).map((p) => p.name).join(', ')}
                {lowStockProducts.length > 3 ? '…' : ''}
              </p>
            </div>
            <ArrowRightIcon size={16} style={{ color: '#F59E0B' }} className="shrink-0" />
          </Link>
        </AnimatedSection>
      )}

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
              Voir tout <ArrowRightIcon size={12} />
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