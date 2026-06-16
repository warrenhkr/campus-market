import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { ArrowLeft, Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react'

async function getUserOrders(userId: string) {
  try {
    return await prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        order_items: {
          include: {
            product: {
              include: { shop: true },
            },
          },
        },
        payment: true,
      },
    })
  } catch {
    return []
  }
}

const STATUS_MAP: Record<string, {
  label: string
  color: string
  bg: string
  icon: React.ElementType
}> = {
  PENDING:   { label: 'En attente',  color: '#F59E0B', bg: '#F59E0B18', icon: Clock },
  SHIPPED:   { label: 'Expédié',     color: '#3B82F6', bg: '#3B82F618', icon: Truck },
  DELIVERED: { label: 'Livré',       color: '#10B981', bg: '#10B98118', icon: CheckCircle },
  COMPLETED: { label: 'Complété',    color: '#10B981', bg: '#10B98118', icon: CheckCircle },
  CANCELLED: { label: 'Annulé',      color: '#F87171', bg: '#F8717118', icon: XCircle },
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const orders = await getUserOrders(user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Mes commandes
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {orders.length} commande{orders.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </AnimatedSection>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
            const StatusIcon = status.icon
            const firstItem = order.order_items[0]

            return (
              <AnimatedCard key={order.id} index={i}>
                <Link href={`/account/orders/${order.id}`}>
                  <div
                    className="rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Header commande */}
                    <div
                      className="flex items-center justify-between px-5 py-3"
                      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono" style={{ color: 'var(--subtle)' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--subtle)' }}>•</span>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: status.bg, color: status.color }}
                      >
                        <StatusIcon size={11} />
                        {status.label}
                      </div>
                    </div>

                    {/* Produits */}
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        {/* Image premier produit */}
                        <div
                          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          {firstItem?.product.image_url ? (
                            <Image
                              src={firstItem.product.image_url}
                              alt={firstItem.product.name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package size={24} style={{ color: 'var(--subtle)' }} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate"
                            style={{ color: 'var(--foreground)' }}>
                            {firstItem?.product.name ?? 'Produit'}
                          </p>
                          {order.order_items.length > 1 && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                              + {order.order_items.length - 1} autre{order.order_items.length > 2 ? 's' : ''} article{order.order_items.length > 2 ? 's' : ''}
                            </p>
                          )}
                          <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                            {firstItem?.product.shop?.name}
                          </p>
                        </div>

                        {/* Prix */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                            {new Intl.NumberFormat('fr-FR').format(Number(order.total_amount))}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>FCFA</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
            )
          })}
        </div>
      ) : (
        <AnimatedSection>
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Aucune commande pour l&apos;instant
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Tu n&apos;as pas encore passé de commande.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Explorer les produits
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}