'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Store, Settings2, CreditCard, TrendingUp, Star, Users, Headphones, MoreHorizontal, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ShopSwitcher } from '@/components/seller/ShopSwitcher'

const NAV = [
  { href: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/products', label: 'Produits', icon: Package },
  { href: '/seller/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/seller/customers', label: 'Clients', icon: Users },
  { href: '/seller/earnings', label: 'Gains', icon: TrendingUp },
  { href: '/seller/shop', label: 'Ma boutique', icon: Store },
  { href: '/seller/reviews', label: 'Avis reçus', icon: Star },
  { href: '/seller/subscription', label: 'Abonnement', icon: CreditCard },
  { href: '/seller/settings', label: 'Paramètres', icon: Settings2 },
  { href: '/seller/help', label: 'Centre d’aide', icon: Headphones },
]

// Sur mobile, quatre accès fréquents restent visibles; le reste est disponible
// dans le panneau "Plus".
const MOBILE_PRIMARY = ['/seller', '/seller/products', '/seller/orders', '/seller/shop']

function isActiveHref(pathname: string, href: string) {
  return href === '/seller' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

interface SellerNavProps {
  shops?: Array<{ id: string; name: string; slug: string; logo_url: string | null }>
  activeShopId?: string
}

export function SellerNav({ shops = [], activeShopId = '' }: SellerNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  const primaryItems = NAV.filter((item) => MOBILE_PRIMARY.includes(item.href))
  const secondaryItems = NAV.filter((item) => !MOBILE_PRIMARY.includes(item.href))
  const isSecondaryActive = secondaryItems.some((item) => isActiveHref(pathname, item.href))

  return (
    <>
      {/* Desktop / tablette : sidebar verticale fixe — tous les liens visibles
          sans avoir à faire défiler, standard pour ce type d'espace de gestion. */}
      <nav className="hidden md:sticky md:top-24 md:flex md:w-64 md:shrink-0 md:flex-col md:gap-1 md:pr-2 md:pt-3">
        {shops.length > 1 && (
          <div className="mb-3">
            <ShopSwitcher shops={shops} activeShopId={activeShopId} />
          </div>
        )}
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveHref(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium leading-5 transition-colors duration-150',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon size={17} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile : bottom nav dédiée au vendeur (remplace visuellement la bottom
          nav acheteur, hors-contexte ici) — 4 actions fréquentes + "Plus". */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[80] flex h-20 items-center justify-around border-t border-white/10 bg-[#111111]/95 px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md md:hidden"
      >
        {primaryItems.map(({ href, label, icon: Icon }) => {
          const isActive = isActiveHref(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              className="relative flex h-full w-full flex-col items-center justify-center gap-1 py-1.5"
            >
              {isActive && (
                <motion.div
                  layoutId="sellerBottomNavIndicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'rgba(163, 230, 53, 0.1)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" style={{ color: isActive ? '#A3E635' : '#9CA3AF' }} />
              <span className="relative z-10 text-[10px] font-medium" style={{ color: isActive ? '#A3E635' : '#9CA3AF' }}>
                {label}
              </span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="relative flex h-full w-full flex-col items-center justify-center gap-1 py-1.5"
        >
          {isSecondaryActive && (
            <motion.div
              layoutId="sellerBottomNavIndicator"
              className="absolute inset-0 rounded-xl"
              style={{ background: 'rgba(163, 230, 53, 0.1)' }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <MoreHorizontal size={22} strokeWidth={isSecondaryActive ? 2.5 : 2} className="relative z-10" style={{ color: isSecondaryActive ? '#A3E635' : '#9CA3AF' }} />
          <span className="relative z-10 text-[10px] font-medium" style={{ color: isSecondaryActive ? '#A3E635' : '#9CA3AF' }}>
            Plus
          </span>
        </button>
      </nav>

      {/* Panneau "Plus" — feuille du bas listant le reste des sections */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-20 z-[90] rounded-t-3xl p-4 pb-8 md:hidden"
              style={{ background: 'var(--popover)', border: '1px solid var(--border)', borderBottom: 'none' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Plus d’options</p>
                <button type="button" onClick={() => setMoreOpen(false)} className="text-[var(--muted-foreground)]">
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {NAV.map(({ href, label, icon: Icon }) => {
                    const isActive = isActiveHref(pathname, href)
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                          isActive ? 'bg-primary/15 text-primary' : 'bg-[var(--surface-2)] text-[var(--foreground)]'
                        )}
                      >
                        <Icon size={17} />
                        {label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
