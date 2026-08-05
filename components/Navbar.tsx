'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  ShoppingBag, Search, Menu, X, User, LogOut,
  LayoutDashboard, Package, Heart, ShoppingCart, Store,
} from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Role = 'USER' | 'SELLER' | 'ADMIN' | null

interface UserProfile {
  name: string | null
  email: string
  role: Role
}

const menuByRole: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  USER: [
    { href: '/products',       label: 'Produits',   icon: Package },
    { href: '/account',        label: 'Mon compte', icon: LayoutDashboard },
    { href: '/account/orders', label: 'Commandes',  icon: ShoppingCart },
    { href: '/account/cart',   label: 'Panier',     icon: Heart },
  ],
  SELLER: [
    { href: '/products',            label: 'Produits',     icon: Package },
    { href: '/seller',              label: 'Dashboard',    icon: LayoutDashboard },
    { href: '/seller/products',     label: 'Mes produits', icon: Package },
    { href: '/seller/products/new', label: '+ Ajouter',    icon: Store },
  ],
  ADMIN: [
    { href: '/products',       label: 'Produits',   icon: Package },
    { href: '/account',        label: 'Mon compte', icon: LayoutDashboard },
    { href: '/account/orders', label: 'Commandes',  icon: ShoppingCart },
  ],
}

export function Navbar() {
  const pathname                    = usePathname()
  const router                      = useRouter()
  const [search, setSearch]         = useState('')
  const [profile, setProfile]       = useState<UserProfile | null>(null)
  const [loading, setLoading]       = useState(true)
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('name, email, role')
          .eq('id', user.id)
          .single()
        if (data) setProfile(data)
        else setProfile({ name: user.user_metadata?.name ?? null, email: user.email!, role: 'USER' as Role })
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        supabase.from('users')
          .select('name, email, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data)
            else setProfile({ name: session.user.user_metadata?.name ?? null, email: session.user.email!, role: 'USER' as Role })
            setLoading(false)
          })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?search=${encodeURIComponent(search)}`)
  }

  const menuItems = profile?.role ? (menuByRole[profile.role] ?? menuByRole.USER) : []

  const initials = profile?.name
    ? profile.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() ?? 'U'

  const firstName = profile?.name?.split(' ')[0] ?? profile?.email?.split('@')[0] ?? null

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-(--background)/90 backdrop-blur-xl border-b border-border'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-5">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--primary)' }}>
              <ShoppingBag size={16} style={{ color: 'var(--primary-foreground)' }} />
            </div>
            <span className="font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Campus Market
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--subtle)' }} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="pl-9 h-9 text-sm"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </form>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {!loading && (
              profile ? (
                <>
                  {menuItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors',
                        pathname === href
                          ? 'bg-(--primary-dim) text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-(--surface-2)'
                      )}
                    >
                      <Icon size={14} />
                      {label}
                    </Link>
                  ))}

                  <ThemeToggle />
                  <NotificationBell/>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="ml-1 flex items-center gap-2 px-2 py-1.5 rounded-lg
                        hover:bg-(--surface-2) transition-colors">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-xs font-bold"
                            style={{
                              background: 'var(--primary-dim)',
                              color: 'var(--primary)',
                            }}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs max-w-25 truncate"
                          style={{ color: 'var(--muted-foreground)' }}>
                          {firstName}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                      }}>
                      <DropdownMenuItem asChild>
                        <Link
                          href={profile.role === 'SELLER' ? '/seller' : '/account'}
                          className="cursor-pointer"
                          style={{ color: 'var(--foreground)' }}
                        >
                          <LayoutDashboard size={14} className="mr-2" />
                          {profile.role === 'SELLER' ? 'Dashboard vendeur' : 'Mon compte'}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                        style={{ color: 'var(--destructive)' }}
                      >
                        <LogOut size={14} className="mr-2" />
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/products">
                    <Button variant="ghost" size="sm"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Produits
                    </Button>
                  </Link>

                  <ThemeToggle />

                  <Link href="/login">
                    <Button variant="ghost" size="sm"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="font-semibold"
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                      }}>
                      S&apos;inscrire
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"
                  style={{ color: 'var(--foreground)' }}>
                  <Menu size={22} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}>
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <SheetDescription className="sr-only">Navigation mobile pour Campus Market</SheetDescription>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                      Menu
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                      <X size={18} />
                    </Button>
                  </div>

                  <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false) }}
                    className="px-4 py-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--subtle)' }} />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="pl-9 h-9 text-sm"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>
                  </form>

                  <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {!loading && (
                      profile ? (
                        <>
                          {menuItems.map(({ href, label, icon: Icon }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors',
                                pathname === href
                                  ? 'bg-(--primary-dim) text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-(--surface-2)'
                              )}
                            >
                              <Icon size={16} />
                              {label}
                            </Link>
                          ))}
                          <button
                            onClick={() => { handleLogout(); setMobileOpen(false) }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors"
                            style={{ color: 'var(--destructive)' }}
                          >
                            <LogOut size={16} />
                            Déconnexion
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/products" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                            style={{ color: 'var(--muted-foreground)' }}>
                            <Package size={16} /> Produits
                          </Link>
                          <Link href="/login" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                            style={{ color: 'var(--muted-foreground)' }}>
                            <User size={16} /> Connexion
                          </Link>
                          <Link href="/register" onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                            style={{
                              background: 'var(--primary)',
                              color: 'var(--primary-foreground)',
                            }}>
                            <User size={16} /> S&apos;inscrire
                          </Link>
                        </>
                      )
                    )}
                  </nav>

                  {profile && (
                    <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold"
                            style={{
                              background: 'var(--primary-dim)',
                              color: 'var(--primary)',
                            }}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate"
                            style={{ color: 'var(--foreground)' }}>
                            {profile.name ?? firstName ?? 'Utilisateur'}
                          </p>
                          <p className="text-[10px] truncate"
                            style={{ color: 'var(--subtle)' }}>
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  )
}