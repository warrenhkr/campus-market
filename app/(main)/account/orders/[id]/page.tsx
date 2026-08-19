import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import {
  ArrowLeft, Clock, CheckCircle, Package,
  Truck, XCircle, CreditCard, Store,
} from '@/components/ServerIcons'

async function getOrder(orderId: string, userId: string) {
  try {
    return await prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: {
        order_items: {
          include: {
            product: {
              include: { shop: true, category: true },
            },
          },
        },
        payment: true,
      },
    })
  } catch {
    return null
  }
}

const STATUS_MAP: Record<string, {
  label: string
  color: string
  bg: string
  icon: React.ElementType
  desc: string
}> = {
  PENDING:   { label: 'En attente',  color: '#F59E0B', bg: '#F59E0B18', icon: Clock,        desc: 'Ta commande est en attente de confirmation.' },
  SHIPPED:   { label: 'Expédié',     color: '#3B82F6', bg: '#3B82F618', icon: Truck,        desc: 'Ta commande est en cours de livraison.' },
  DELIVERED: { label: 'Livré',       color: '#10B981', bg: '#10B98118', icon: CheckCircle,  desc: 'Ta commande a été livrée avec succès.' },
  COMPLETED: { label: 'Complété',    color: '#10B981', bg: '#10B98118', icon: CheckCircle,  desc: 'Ta commande est complétée.' },
  CANCELLED: { label: 'Annulé',      color: '#F87171', bg: '#F8717118', icon: XCircle,      desc: 'Ta commande a été annulée.' },
}

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'En attente',  color: '#F59E0B' },
  AUTHORIZED: { label: 'Autorisé',   color: '#3B82F6' },
  CAPTURED:   { label: 'Payé',       color: '#10B981' },
  FAILED:     { label: 'Échoué',     color: '#F87171' },
  REFUNDED:   { label: 'Remboursé',  color: '#8B5CF6' },
}

const STEPS = [
  { key: 'PENDING',   label: 'Commande passée', icon: Clock },
  { key: 'SHIPPED',   label: 'Expédié',          icon: Truck },
  { key: 'DELIVERED', label: 'Livré',             icon: CheckCircle },
]

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const order = await getOrder(id, user.id)
  if (!order) notFound()

  const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
  const StatusIcon = status.icon
  const paymentStatus = order.payment
    ? PAYMENT_STATUS_MAP[order.payment.status] ?? PAYMENT_STATUS_MAP.PENDING
    : null

  const currentStepIndex = STEPS.findIndex(s => s.key === order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account/orders"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Commande
            </h1>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--subtle)' }}>
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: status.bg, color: status.color }}
          >
            <StatusIcon size={11} />
            {status.label}
          </div>
        </div>
      </AnimatedSection>

      {/* Stepper (seulement si pas annulé) */}
      {order.status !== 'CANCELLED' && (
        <AnimatedSection delay={0.1}>
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between relative">
              {/* Ligne de progression */}
              <div
                className="absolute top-4 left-0 right-0 h-0.5"
                style={{ background: 'var(--surface-3)' }}
              />
              <div
                className="absolute top-4 left-0 h-0.5 transition-all duration-500"
                style={{
                  background: 'var(--primary)',
                  width: currentStepIndex >= 0
                    ? `${(currentStepIndex / (STEPS.length - 1)) * 100}%`
                    : '0%',
                }}
              />

              {STEPS.map((step, i) => {
                const StepIcon = step.icon
                const isDone = i <= currentStepIndex
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: isDone ? 'var(--primary)' : 'var(--surface-3)',
                        border: isDone ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <StepIcon size={14} style={{
                        color: isDone ? 'var(--primary-foreground)' : 'var(--subtle)'
                      }} />
                    </div>
                    <p className="text-xs font-medium text-center"
                      style={{ color: isDone ? 'var(--foreground)' : 'var(--subtle)' }}>
                      {step.label}
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-center mt-4" style={{ color: 'var(--muted-foreground)' }}>
              {status.desc}
            </p>
          </div>
        </AnimatedSection>
      )}

      {/* Articles */}
      <AnimatedSection delay={0.15}>
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Articles ({order.order_items.length})
            </p>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'var(--surface-2)' }}
                >
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Package size={20} style={{ color: 'var(--subtle)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate"
                    style={{ color: 'var(--foreground)' }}>
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.product.shop && (
                      <Link
                        href={`/shop/${item.product.shop.slug}`}
                        className="flex items-center gap-1 text-xs transition-colors hover:opacity-70"
                        style={{ color: 'var(--primary)' }}
                      >
                        <Store size={10} />
                        {item.product.shop.name}
                      </Link>
                    )}
                    <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                      × {item.quantity}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-bold flex-shrink-0"
                  style={{ color: 'var(--foreground)' }}>
                  {new Intl.NumberFormat('fr-FR').format(Number(item.price) * item.quantity)} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Résumé paiement */}
      <AnimatedSection delay={0.2}>
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              Récapitulatif
            </p>
          </div>

          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Sous-total
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                {new Intl.NumberFormat('fr-FR').format(Number(order.total_amount))} FCFA
              </span>
            </div>

            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                Total
              </span>
              <span className="text-lg font-extrabold" style={{ color: 'var(--primary)' }}>
                {new Intl.NumberFormat('fr-FR').format(Number(order.total_amount))} FCFA
              </span>
            </div>

            {/* Statut paiement */}
            {order.payment && paymentStatus && (
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={14} style={{ color: 'var(--muted-foreground)' }} />
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {order.payment.method}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${paymentStatus.color}18`,
                    color: paymentStatus.color,
                  }}
                >
                  {paymentStatus.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Date */}
      <AnimatedSection delay={0.25}>
        <p className="text-xs text-center" style={{ color: 'var(--subtle)' }}>
          Commande passée le{' '}
          {new Date(order.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </AnimatedSection>
    </div>
  )
}