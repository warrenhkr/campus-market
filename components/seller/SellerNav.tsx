'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Store, Settings2, CreditCard, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Produits', icon: Package },
  { href: '/seller/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/seller/shop', label: 'Ma boutique', icon: Store },
  { href: '/seller/settings', label: 'Paramètres', icon: Settings2 },
  { href: '/seller/subscription', label: 'Abonnement', icon: CreditCard },
  { href: '/seller/earnings', label: 'Gains', icon: TrendingUp },
  { href: '/seller/reviews', label: 'Avis reçus', icon: Star },
]

export function SellerNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 pt-1 pl-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/seller'
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Button
            asChild
            key={href}
            variant="outline"
            size="lg"
            className={cn(
              'rounded-2xl whitespace-nowrap px-4 py-3 min-h-[3rem] transition-all duration-300 ease-out will-change-transform',
              isActive
                ? 'border-primary bg-primary/15 text-primary shadow-sm scale-[1.01] dark:bg-primary/25 dark:text-primary'
                : 'border-border bg-background text-foreground hover:-translate-y-0.5 hover:scale-[1.01] hover:border-primary/60 hover:bg-primary/15 hover:text-primary hover:shadow-sm dark:bg-card/70 dark:text-foreground dark:hover:border-primary/50 dark:hover:bg-primary/20 dark:hover:text-primary'
            )}
          >
            <Link href={href} className="flex items-center gap-2 text-sm font-medium">
              <Icon size={16} />
              {label}
            </Link>
          </Button>
        )
      })}
    </div>
  )
}
