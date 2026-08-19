'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'

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
      const res = await fetch(`/api/favorites?product_id=${encodeURIComponent(productId)}`)
      if (!res.ok) {
        setChecking(false)
        return
      }

      const json = await res.json()
      setIsFavorite(Boolean(json.favorite))
      setChecking(false)
    }
    check()
  }, [productId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setLoading(true)
    try {
      const url = '/api/favorites'
      const res = await fetch(url, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })

      if (res.status === 401) {
        toast.error('Connecte-toi pour ajouter aux favoris')
        return
      }

      if (!res.ok) {
        toast.error('Une erreur est survenue')
        return
      }

      setIsFavorite(!isFavorite)
      toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris ❤️')
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