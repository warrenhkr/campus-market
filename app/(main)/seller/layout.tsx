import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, Store } from 'lucide-react'

const NAV = [
  { href: '/seller',          label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/seller/products', label: 'Produits',    icon: Package },
  { href: '/seller/orders',   label: 'Commandes',   icon: ShoppingCart },
  { href: '/seller/shop',     label: 'Ma boutique', icon: Store },
]

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'SELLER') redirect('/become-seller')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Nav vendeur */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              whitespace-nowrap transition-all hover:scale-105"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
            }}
          >
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  )
}