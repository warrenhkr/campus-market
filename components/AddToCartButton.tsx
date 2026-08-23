'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'

interface AddToCartButtonProps {
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
    pricing_tier_id?: string | null
    pricing_tier_label?: string | null
    auto_discount?: { enabled: boolean; type: 'FIXED' | 'PERCENT'; value: number } | null
    variant_id?: string | null
    variant_name?: string | null
  }
}

const CART_KEY = 'cm_cart'

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const available = product.stock_mode !== 'OUT_OF_STOCK' && (product.stock_mode !== 'TRACKED' || product.stock > 0)

  const handleAdd = () => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
      const existing = cart.find((i: { id: string; pricing_tier_id?: string | null; variant_id?: string | null }) =>
        i.id === product.id && i.pricing_tier_id === product.pricing_tier_id && i.variant_id === product.variant_id
      )

      if (existing) {
        if (product.stock_mode === 'TRACKED' && existing.quantity >= product.stock) {
          toast.error('Stock maximum atteint')
          return
        }
        existing.quantity += 1
      } else {
        cart.push({ ...product, quantity: 1 })
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart))
      window.dispatchEvent(new Event('cart_updated'))
      setAdded(true)
      toast.success('Ajouté au panier ✅')
      setTimeout(() => setAdded(false), 2000)
    } catch {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={!available}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
        text-sm font-bold transition-all hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{
        background: added ? '#10B981' : available ? 'var(--primary)' : 'var(--surface-2)',
        color: available ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
        boxShadow: available && !added ? '0 0 20px rgba(163,230,53,0.2)' : 'none',
      }}
    >
      {added ? (
        <>
          <Check size={16} />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          {product.stock_mode === 'OUT_OF_STOCK' || (product.stock_mode === 'TRACKED' && product.stock === 0) ? 'Indisponible' : 'Ajouter au panier'}
        </>
      )}
    </button>
  )
}