'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface FavoriteItem {
  id: string
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock: number
    shop: { name: string } | null
    category: { name: string } | null
  }
}

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch('/api/favorites')
        const data = await res.json()
        setFavorites(data.favorites ?? [])
      } catch {
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleRemove = async (productId: string, favoriteId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== favoriteId))
    try {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      toast.success('Retiré des favoris')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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
              Mes favoris
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {favorites.length} produit{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <AnimatePresence>
            {favorites.map((fav, i) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div
                  className="rounded-2xl overflow-hidden group"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="relative">
                    <Link href={`/products/${fav.product.id}`}>
                      <div
                        className="relative flex items-center justify-center"
                        style={{ aspectRatio: '4/3', background: 'var(--surface-2)' }}
                      >
                        {fav.product.image_url ? (
                          <Image
                            src={fav.product.image_url}
                            alt={fav.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-4xl">📦</span>
                        )}
                      </div>
                    </Link>

                    <button
                      onClick={() => handleRemove(fav.product.id, fav.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full
                        flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(8px)' }}
                    >
                      <Trash2 size={14} style={{ color: '#F87171' }} />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link href={`/products/${fav.product.id}`}>
                      <p className="text-sm font-semibold mb-2 line-clamp-2 hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--foreground)' }}>
                        {fav.product.name}
                      </p>
                    </Link>
                    {fav.product.shop && (
                      <p className="text-xs mb-2" style={{ color: 'var(--subtle)' }}>
                        {fav.product.shop.name}
                      </p>
                    )}
                    <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                      {new Intl.NumberFormat('fr-FR').format(Number(fav.product.price))}
                      <span className="text-xs font-normal ml-1"
                        style={{ color: 'var(--muted-foreground)' }}>
                        FCFA
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <AnimatedSection>
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Heart size={48} className="mx-auto mb-4" style={{ color: 'var(--subtle)' }} />
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Aucun favori pour l&apos;instant
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Ajoute des produits à tes favoris en cliquant sur le cœur.
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