'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Store, ShoppingCart, Heart, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface CartItem {
  quantity: number
}

const CART_KEY = 'cm_cart'

function getCartCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[]
    return cart.reduce((acc, item) => acc + item.quantity, 0)
  } catch {
    return 0
  }
}

export function BottomNav() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)
  const [userProfile, setUserProfile] = useState<{ initials: string; avatarUrl: string | null } | null>(null)

  useEffect(() => {
    // Initial load
    setCartCount(getCartCount())

    // Listen for storage changes across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setCartCount(getCartCount())
    }
    // Custom event for same-tab updates
    const handleCustomEvent = () => setCartCount(getCartCount())

    window.addEventListener('storage', handleStorage)
    window.addEventListener('cart_updated', handleCustomEvent)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('cart_updated', handleCustomEvent)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const loadUser = async () => {
      const res = await fetch('/api/user')
      if (!res.ok) {
        setUserProfile(null)
        return
      }

      const json = await res.json()
      const profile = json.profile
      if (!profile) {
        setUserProfile(null)
        return
      }

      let name = profile.name ?? profile.email
      let avatarUrl = profile.avatar_url ?? null
      const initials = name
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

      setUserProfile({ initials, avatarUrl })
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Catalogue', href: '/products', icon: Store },
    { name: 'Panier', href: '/account/cart', icon: ShoppingCart, badge: cartCount },
    { name: 'Favoris', href: '/account/favorites', icon: Heart },
    { name: 'Compte', href: '/account', icon: User },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <nav
        className="flex items-center justify-around h-16 rounded-2xl shadow-xl backdrop-blur-md"
        style={{
          background: 'rgba(17, 17, 17, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-full h-full gap-1 tap-highlight-transparent"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'rgba(163, 230, 53, 0.1)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex items-center justify-center">
                {item.name === 'Compte' && userProfile ? (
                  <Avatar className={cn('w-6 h-6 border transition-colors', isActive ? 'border-[#A3E635]' : 'border-transparent')}>
                    {userProfile.avatarUrl ? (
                      // Using img directly inside avatar to match simple fallback style
                      <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="text-[10px] font-bold"
                        style={{
                          background: isActive ? '#A3E635' : 'var(--surface-2)',
                          color: isActive ? '#000' : 'var(--muted-foreground)',
                        }}>
                        {userProfile.initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ) : (
                  <item.icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-colors"
                    style={{ color: isActive ? '#A3E635' : '#888888' }}
                  />
                )}
                
                {/* Badge Panier */}
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold shadow-sm"
                    style={{ background: '#A3E635', color: '#000' }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.div>
                )}
              </div>
              
              <span
                className="text-[10px] font-medium z-10 transition-colors"
                style={{ color: isActive ? '#A3E635' : '#888888' }}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
