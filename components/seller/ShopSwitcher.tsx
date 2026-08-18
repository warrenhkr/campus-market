'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, ChevronDown, Check, Plus } from 'lucide-react'
import Link from 'next/link'

interface ShopOption {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

interface ShopSwitcherProps {
  shops: ShopOption[]
  activeShopId: string
}

export function ShopSwitcher({ shops, activeShopId }: ShopSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Un vendeur avec une seule boutique n'a pas besoin d'un sélecteur — le
  // switcher n'apparaît que lorsqu'il y a un vrai choix à faire.
  if (shops.length <= 1) return null

  const activeShop = shops.find((shop) => shop.id === activeShopId) ?? shops[0]

  const switchTo = (shopId: string) => {
    document.cookie = `active_shop_id=${shopId}; path=/; max-age=${60 * 60 * 24 * 365}`
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      >
        <Store size={15} style={{ color: 'var(--primary)' }} />
        <span className="max-w-[140px] truncate">{activeShop.name}</span>
        <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border shadow-lg"
            style={{ borderColor: 'var(--border)', background: 'var(--popover)' }}
          >
            <div className="max-h-72 overflow-y-auto p-1.5">
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => switchTo(shop.id)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
                  style={{ color: 'var(--foreground)' }}
                >
                  <Store size={15} style={{ color: 'var(--muted-foreground)' }} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{shop.name}</span>
                  {shop.id === activeShop.id && <Check size={15} style={{ color: 'var(--primary)' }} className="shrink-0" />}
                </button>
              ))}
            </div>
            <Link
              href="/seller/shop/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 border-t px-3 py-2.5 text-sm font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
            >
              <Plus size={15} />
              Créer une nouvelle boutique
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
