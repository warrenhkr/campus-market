'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface ShopDetailsFormProps {
  shopId: string
  name: string
  description?: string | null
  contact_name?: string | null
  contact_phone?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  website_url?: string | null
}

export function ShopDetailsForm({
  shopId,
  name,
  description,
  contact_name,
  contact_phone,
  facebook_url,
  instagram_url,
  website_url,
}: ShopDetailsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [shopName, setShopName] = useState(name)
  const [shopDescription, setShopDescription] = useState(description ?? '')
  const [contactName, setContactName] = useState(contact_name ?? '')
  const [contactPhone, setContactPhone] = useState(contact_phone ?? '')
  const [facebookUrl, setFacebookUrl] = useState(facebook_url ?? '')
  const [instagramUrl, setInstagramUrl] = useState(instagram_url ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(website_url ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const res = await fetch('/api/seller/shop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shopId,
            name: shopName,
            description: shopDescription,
            contact_name: contactName,
            contact_phone: contactPhone,
            facebook_url: facebookUrl,
            instagram_url: instagramUrl,
            website_url: websiteUrl,
          }),
        })

        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Impossible de mettre à jour la boutique.')
          return
        }

        toast.success('Détails de la boutique mis à jour.')
      } catch (err) {
        toast.error('Erreur réseau. Réessaie plus tard.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Nom de la boutique
          </label>
          <Input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            required
            className="h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Nom du contact
          </label>
          <Input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Téléphone
          </label>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+229 90 00 00 00"
            className="h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Facebook
          </label>
          <Input
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://facebook.com/..."
            className="h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Facebook
          </label>
          <Input
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://facebook.com/..."
            className="h-10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Instagram
          </label>
          <Input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/..."
            className="h-10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Site web
        </label>
        <Input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://..."
          className="h-10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
          Description détaillée
        </label>
        <Textarea
          value={shopDescription}
          onChange={(e) => setShopDescription(e.target.value)}
          rows={4}
          className="min-h-[140px]"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer les détails'}
        </Button>
      </div>
    </form>
  )
}
