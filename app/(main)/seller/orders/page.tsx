import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

async function getSellerOrders(userId: string) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { user_id: userId },
    })
    if (!seller) return null

    const orders = await prisma.order.findMany({
      where: {
        order_items: {
          some: {
            product: { shop: { seller_id: seller.id } },
          },
        },
      },
      include: {
        order_items: {
          where: {
            product: { shop: { seller_id: seller.id } },
          },
          include: {
            product: { include: { shop: true } },
          },
        },
        payment: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return { seller, orders }
  } catch {
    return null
  }
}

const STATUS_MAP: Record<string, {
  label: string
  color: string
  icon: React.ElementType
}> = {
  PENDING:   { label: 'En attente', color: '#F59E0B', icon: Clock },
  SHIPPED:   { label: 'Expédié',    color: '#3B82F6', icon: Truck },
  DELIVERED: { label: 'Livré',      color: '#10B981', icon: CheckCircle },
  COMPLETED: { label: 'Complété',   color: '#10B981', icon: CheckCircle },
  CANCELLED: { label: 'Annulé',     color: '#F87171', icon: XCircle },
}

export default async function SellerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getSellerOrders(user.id)
  if (!data) redirect('/become-seller')

  const { orders } = data

  return (
    <div>
      {/* Header */}
      <AnimatedSection delay={0}>
        <Card className="rounded-3xl border border-border mb-8">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Commandes reçues
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {orders.length} commande{orders.length > 1 ? 's' : ''} au total
            </p>
          </CardHeader>
        </Card>
      </AnimatedSection>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
            const StatusIcon = status.icon

            return (
              <AnimatedCard key={order.id} index={i}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {/* Header */}
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
                      style={{ background: `${status.color}18`, color: status.color }}
                    >
                      <StatusIcon size={11} />
                      {status.label}
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                        <div
                          className="w-12 h-12 rounded-xl overflow-hidden shrink-0
                            flex items-center justify-center"
                          style={{ background: 'var(--surface-2)' }}
                        >
                          {item.product.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <Package size={18} style={{ color: 'var(--subtle)' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate"
                            style={{ color: 'var(--foreground)' }}>
                            {item.product.name}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>
                            Quantité : {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold shrink-0"
                          style={{ color: 'var(--primary)' }}>
                          {new Intl.NumberFormat('fr-FR').format(
                            Number(item.price) * item.quantity
                          )} FCFA
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Total commande
                    </span>
                    <span className="text-base font-extrabold"
                      style={{ color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('fr-FR').format(Number(order.total_amount))} FCFA
                    </span>
                  </div>
                </div>
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
            <p className="text-5xl mb-4">📦</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Aucune commande pour l&apos;instant
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Tes commandes apparaîtront ici dès que des acheteurs commanderont tes produits.
            </p>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}