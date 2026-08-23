'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap } from 'lucide-react'
import { toast } from 'sonner'

export interface ProductSalesActionsProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock: number
    stock_mode: 'UNLIMITED' | 'TRACKED' | 'PREORDER' | 'OUT_OF_STOCK'
    shop_id: string
    shop_name: string
    shop_slug: string
    type: 'PHYSICAL' | 'DIGITAL'
  }
  label?: string
  color?: string
}

const CART_KEY = 'cm_cart'

export function ProductSalesActions({ product, label = 'Acheter maintenant', color }: ProductSalesActionsProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const unavailable = product.stock_mode === 'OUT_OF_STOCK' || (product.stock_mode === 'TRACKED' && product.stock <= 0)

  useEffect(() => {
    router.prefetch('/account/checkout')
  }, [router])

  const addProductToCart = () => {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as Array<Record<string, unknown> & { id: string; quantity: number }>
    const existing = cart.find((item) => item.id === product.id && !item.variant_id && !item.pricing_tier_id)

    if (existing) {
      if (product.stock_mode === 'TRACKED' && existing.quantity >= product.stock) {
        toast.error('Stock maximum atteint')
        return false
      }
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1, variant_id: null, pricing_tier_id: null })
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    window.dispatchEvent(new Event('cart_updated'))
    return true
  }

  const handleBuyNow = () => {
    if (unavailable || isPending) return
    if (addProductToCart()) {
      setIsPending(true)
      router.push('/account/checkout')
    }
  }

  const handleAddToCart = () => {
    if (unavailable || isPending) return
    if (addProductToCart()) toast.success('Ajouté au panier')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleBuyNow}
        disabled={unavailable || isPending}
        aria-busy={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: color || 'var(--primary)' }}
      >
        <Zap size={16} />
        {unavailable ? 'Indisponible' : isPending ? 'Ouverture du paiement...' : label}
      </button>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={unavailable || isPending}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-[var(--surface-2)] px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingCart size={16} />
        Ajouter au panier
      </button>
    </div>
  )
}
