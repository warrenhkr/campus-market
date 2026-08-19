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
    shop_id: string
    shop_name: string
    shop_slug: string
    type: 'PHYSICAL' | 'DIGITAL'
  }
}

const CART_KEY = 'cm_cart'

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
      const existing = cart.find((i: { id: string }) => i.id === product.id)

      if (existing) {
        if (existing.quantity >= product.stock) {
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
      disabled={product.stock === 0}
      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl
        text-sm font-bold transition-all hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{
        background: added ? '#10B981' : product.stock > 0 ? 'var(--primary)' : 'var(--surface-2)',
        color: product.stock > 0 ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
        boxShadow: product.stock > 0 && !added ? '0 0 20px rgba(163,230,53,0.2)' : 'none',
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
          {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
        </>
      )}
    </button>
  )
}