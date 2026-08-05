import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { TrendingUp, Calendar, Banknote, Clock, CheckCircle, XCircle } from 'lucide-react'

async function getEarningsData(userId: string) {
  const seller = await prisma.seller.findUnique({
    where: { user_id: userId },
    select: { id: true, shops: { select: { id: true } } },
  })
  if (!seller) return null

  const shopIds = seller.shops.map(s => s.id)

  // Récupère tous les paiements liés aux commandes contenant des produits du vendeur
  const payments = await prisma.payment.findMany({
    where: {
      order: {
        order_items: {
          some: { product: { shop_id: { in: shopIds } } }
        }
      }
    },
    include: {
      order: {
        select: {
          id: true,
          order_date: true,
          status: true,
          order_items: {
            where: { product: { shop_id: { in: shopIds } } },
            include: { product: { select: { name: true } } },
          },
        }
      }
    },
    orderBy: { created_at: 'desc' },
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalEarnings = payments
    .filter(p => p.status === 'CAPTURED')
    .reduce((sum, p) => sum + Number(p.seller_earning), 0)

  const monthEarnings = payments
    .filter(p => p.status === 'CAPTURED' && new Date(p.created_at) >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.seller_earning), 0)

  return { payments, totalEarnings, monthEarnings }
}

const PAYMENT_STATUS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  CAPTURED:   { label: 'Reçu',        color: '#10B981', icon: CheckCircle },
  PENDING:    { label: 'En attente',  color: '#F59E0B', icon: Clock },
  FAILED:     { label: 'Échoué',      color: '#EF4444', icon: XCircle },
  AUTHORIZED: { label: 'Autorisé',    color: '#3B82F6', icon: Clock },
  REFUNDED:   { label: 'Remboursé',   color: '#8B5CF6', icon: XCircle },
}

export const metadata = { title: 'Mes gains — Campus Market' }

export default async function SellerEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getEarningsData(user.id)
  if (!data) redirect('/become-seller')

  const { payments, totalEarnings, monthEarnings } = data

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Mes gains 💰
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Relevé de vos reversements sur les commandes encaissées.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Gains cumulés',         value: `${fmt(totalEarnings)} FCFA`,  icon: TrendingUp, color: '#10B981' },
          { label: 'Gains du mois en cours', value: `${fmt(monthEarnings)} FCFA`, icon: Calendar,  color: '#3B82F6' },
          { label: 'Transactions',           value: payments.length,              icon: Banknote,  color: '#A3E635' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-2xl font-extrabold mb-0.5" style={{ color: 'var(--foreground)' }}>
              {value}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Payout notice */}
      <div className="rounded-2xl p-5 flex items-start gap-3"
        style={{ background: '#F59E0B10', border: '1px solid #F59E0B30' }}>
        <span className="text-xl">⏳</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            Demande de retrait
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Bientôt disponible — le système de retrait vers votre compte Mobile Money est en cours de déploiement.
          </p>
        </div>
      </div>

      {/* Table des paiements */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
            Historique des paiements
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Aucun paiement pour l&apos;instant
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Les paiements apparaîtront ici dès vos premières ventes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-secondary, #f9fafb)' }}>
                  {['Date', 'Commande', 'Produit', 'Montant brut', 'Votre gain', 'Statut'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wide"
                      style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => {
                  const st = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.PENDING
                  const Icon = st.icon
                  const firstProduct = payment.order.order_items[0]?.product
                  return (
                    <tr key={payment.id} style={{ borderBottom: '1px solid var(--border)' }}
                      className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                        #{payment.order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--foreground)' }}>
                        {firstProduct?.name ?? '—'}
                        {payment.order.order_items.length > 1 && (
                          <span style={{ color: 'var(--muted-foreground)' }}>
                            {' '}+{payment.order.order_items.length - 1}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold" style={{ color: 'var(--foreground)' }}>
                        {fmt(Number(payment.amount))} FCFA
                      </td>
                      <td className="px-6 py-4 font-bold" style={{ color: '#10B981' }}>
                        {fmt(Number(payment.seller_earning))} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: `${st.color}15`, color: st.color }}>
                          <Icon size={11} />
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
