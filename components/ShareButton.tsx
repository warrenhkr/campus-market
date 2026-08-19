'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'

export function ShareButton({ productId }: { productId: string }) {
  const [done, setDone] = useState(false)

  const handleCopy = async () => {
    try {
      const url = typeof window !== 'undefined'
        ? window.location.href
        : `/products/${productId}`
      await navigator.clipboard.writeText(url)
      setDone(true)
      toast.success('Lien copié dans le presse-papiers')
      setTimeout(() => setDone(false), 1800)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--muted-foreground)',
      }}
    >
      {done ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  )
}
