import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Phone, GraduationCap } from '@/components/ServerIcons'

async function getSellerCustomers(userId: string) {
  const seller = await prisma.seller.findUnique({ where: { user_id: userId } })
  if (!seller) return null

  const orders = await prisma.order.findMany({
    where: { order_items: { some: { product: { shop: { seller_id: seller.id } } } } },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, university: true } },
      order_items: {
        where: { product: { shop: { seller_id: seller.id } } },
        select: { quantity: true, price: true },
      },
    },
    orderBy: { order_date: 'desc' },
  })

  const customersMap = new Map<string, {
    id: string
    name: string
    email: string
    phone: string | null
    university: string | null
    ordersCount: number
    totalSpent: number
    lastOrderDate: Date
  }>()

  for (const order of orders) {
    const lineTotal = order.order_items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    const existing = customersMap.get(order.user.id)
    if (existing) {
      existing.ordersCount += 1
      existing.totalSpent += lineTotal
      if (order.order_date > existing.lastOrderDate) existing.lastOrderDate = order.order_date
    } else {
      customersMap.set(order.user.id, {
        id: order.user.id,
        name: order.user.name ?? order.user.email.split('@')[0],
        email: order.user.email,
        phone: order.user.phone,
        university: order.user.university,
        ordersCount: 1,
        totalSpent: lineTotal,
        lastOrderDate: order.order_date,
      })
    }
  }

  return Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)
}

export default async function SellerCustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const customers = await getSellerCustomers(user.id)
  if (customers === null) redirect('/become-seller')

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)

  return (
    <div className="space-y-6 pt-2 md:pt-3">
      <AnimatedSection>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--primary-dim)' }}>
            <Users size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Clients</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {customers.length} client{customers.length > 1 ? 's' : ''} · {new Intl.NumberFormat('fr-FR').format(totalRevenue)} FCFA de ventes cumulées
            </p>
          </div>
        </div>
      </AnimatedSection>

      {customers.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-border">
          <CardHeader className="items-center text-center py-16">
            <Users size={32} style={{ color: 'var(--muted-foreground)' }} />
            <CardTitle className="mt-3 text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Pas encore de clients
            </CardTitle>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Tes premiers acheteurs apparaîtront ici après leur première commande.
            </p>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="rounded-2xl border border-border">
              <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                  >
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{customer.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="flex items-center gap-1"><Mail size={11} />{customer.email}</span>
                      {customer.phone && <span className="flex items-center gap-1"><Phone size={11} />{customer.phone}</span>}
                      {customer.university && <span className="flex items-center gap-1"><GraduationCap size={11} />{customer.university}</span>}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {new Intl.NumberFormat('fr-FR').format(customer.totalSpent)} FCFA
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {customer.ordersCount} commande{customer.ordersCount > 1 ? 's' : ''}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
