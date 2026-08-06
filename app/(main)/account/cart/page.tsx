'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'
import { toast } from 'sonner'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  shop_name: string
  shop_slug: string
  stock: number
  quantity: number
}

const CART_KEY = 'cm_cart'

function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('cart_updated'))
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(getCart())
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== id) return item
        const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta))
        return { ...item, quantity: newQty }
      })
      saveCart(updated)
      return updated
    })
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id)
      saveCart(updated)
      return updated
    })
    toast.success('Article retiré du panier')
  }

  const clearCart = () => {
    setItems([])
    saveCart([])
  }

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return { items, updateQuantity, removeItem, clearCart, total }
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: 'var(--primary)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Mon panier
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {items.length} article{items.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {items.length > 0 ? (
        <>
          {/* Liste articles */}
          <div className="space-y-3 mb-6">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <div
                    className="rounded-2xl p-4 flex items-center gap-4"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {/* Image */}
                    <Link href={`/products/${item.id}`}>
                      <div
                        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0
                          flex items-center justify-center"
                        style={{ background: 'var(--surface-2)' }}
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.id}`}>
                        <p className="text-sm font-semibold truncate hover:opacity-70 transition-opacity"
                          style={{ color: 'var(--foreground)' }}>
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>
                        {item.shop_name}
                      </p>
                      <p className="text-sm font-bold mt-1" style={{ color: 'var(--primary)' }}>
                        {new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA
                      </p>
                    </div>

                    {/* Quantité */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 rounded-lg flex items-center justify-center
                          transition-all hover:scale-110 disabled:opacity-30"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold"
                        style={{ color: 'var(--foreground)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-lg flex items-center justify-center
                          transition-all hover:scale-110 disabled:opacity-30"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        transition-all hover:scale-110 flex-shrink-0"
                      style={{
                        background: '#F8717118',
                        color: '#F87171',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Résumé */}
          <AnimatedSection delay={0.2}>
            <div
              className="rounded-2xl p-5 mb-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Sous-total ({items.length} article{items.length > 1 ? 's' : ''})
                </span>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {new Intl.NumberFormat('fr-FR').format(total)} FCFA
                </span>
              </div>
              <div
                className="flex items-center justify-between pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="text-base font-bold" style={{ color: 'var(--foreground)' }}>
                  Total
                </span>
                <span className="text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
                  {new Intl.NumberFormat('fr-FR').format(total)} FCFA
                </span>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Link
                href="/account/checkout"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                  text-sm font-bold transition-all hover:scale-[1.02]"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '0 0 20px rgba(163,230,53,0.2)',
                }}
              >
                <ShoppingCart size={16} />
                Passer la commande
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </AnimatedSection>
        </>
      ) : (
        <AnimatedSection>
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Ton panier est vide
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Explore le catalogue et ajoute des articles à ton panier.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Explorer les produits
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}