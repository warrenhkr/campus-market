'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setChecking(false)
        return
      }

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      setIsFavorite(!!data)
      setChecking(false)
    }
    check()
  }, [productId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Connecte-toi pour ajouter aux favoris')
      return
    }

    setLoading(true)
    try {
      if (isFavorite) {
        const res = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
        if (res.ok) {
          setIsFavorite(false)
          toast.success('Retiré des favoris')
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
        if (res.ok) {
          setIsFavorite(true)
          toast.success('Ajouté aux favoris ❤️')
        }
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={className ?? `w-9 h-9 rounded-xl flex items-center justify-center
        transition-all hover:scale-110 disabled:opacity-50`}
      style={{
        background: isFavorite ? '#F8717118' : 'var(--surface-2)',
        border: `1px solid ${isFavorite ? '#F8717130' : 'var(--border)'}`,
      }}
    >
      <Heart
        size={16}
        fill={isFavorite ? '#F87171' : 'none'}
        style={{ color: isFavorite ? '#F87171' : 'var(--muted-foreground)' }}
      />
    </button>
  )
}