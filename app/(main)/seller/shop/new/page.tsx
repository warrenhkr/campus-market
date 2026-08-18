'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewShopPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error('Nom de boutique requis')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/seller/shops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description: description || null }),
        })
        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? 'Impossible de créer la boutique')
          return
        }

        // La nouvelle boutique devient la boutique active
        document.cookie = `active_shop_id=${data.shop.id}; path=/; max-age=${60 * 60 * 24 * 365}`
        toast.success('Boutique créée !')
        router.push('/seller/shop')
        router.refresh()
      } catch {
        toast.error('Erreur réseau, réessaie plus tard')
      }
    })
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link href="/seller/shop" className="mb-6 inline-flex items-center gap-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
        <ArrowLeft size={15} /> Retour
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--primary-dim)' }}>
          <Store size={20} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Nouvelle boutique</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Gère plusieurs boutiques et bascule facilement entre elles.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Nom de la boutique
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Fournitures ENEAM"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            Description (optionnelle)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Ce que tu proposes dans cette boutique..."
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Création...' : 'Créer la boutique'}
        </Button>
      </form>
    </div>
  )
}
