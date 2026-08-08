'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, Store, Image as ImageIcon, ShoppingBag, Truck, CreditCard, Bell, Share2, Search, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ImageUpload'

interface ShopSettingsFormProps {
  shop: {
    id: string
    name: string
    slug: string
    description?: string | null
    email?: string | null
    phone?: string | null
    image_url?: string | null
    logo_url?: string | null
    banner_url?: string | null
    favicon_url?: string | null
    contact_name?: string | null
    contact_phone?: string | null
    whatsapp_url?: string | null
    facebook_url?: string | null
    instagram_url?: string | null
    website_url?: string | null
    tiktok_url?: string | null
    youtube_url?: string | null
    og_image_url?: string | null
    og_image_public_id?: string | null
    currency?: string | null
    language?: string | null
    timezone?: string | null
    status?: string | null
    primary_color?: string | null
    secondary_color?: string | null
    accent_color?: string | null
    background_color?: string | null
    text_color?: string | null
    show_banner?: boolean | null
    show_categories?: boolean | null
    show_featured_products?: boolean | null
    show_new_products?: boolean | null
    show_reviews?: boolean | null
    show_contact?: boolean | null
    show_social_links?: boolean | null
    delivery_enabled?: boolean | null
    delivery_fee?: number | null
    free_delivery_threshold?: number | null
    pickup_enabled?: boolean | null
    campus_delivery_enabled?: boolean | null
    local_delivery_enabled?: boolean | null
    allow_guest_checkout?: boolean | null
    allow_cancellation?: boolean | null
    meta_title?: string | null
    meta_description?: string | null
  }
}

const sections = [
  { id: 'general', label: 'Général', icon: Store },
  { id: 'appearance', label: 'Apparence', icon: Palette },
  { id: 'delivery', label: 'Livraison', icon: Truck },
  { id: 'payments', label: 'Paiements', icon: CreditCard },
  { id: 'social', label: 'Réseaux', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Search },
]

export function ShopSettingsForm({ shop }: ShopSettingsFormProps) {
  const [activeSection, setActiveSection] = useState('general')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: shop.name ?? '',
    slug: shop.slug ?? '',
    description: shop.description ?? '',
    email: shop.email ?? '',
    phone: shop.phone ?? '',
    contact_name: shop.contact_name ?? '',
    contact_phone: shop.contact_phone ?? '',
    whatsapp_url: shop.whatsapp_url ?? '',
    facebook_url: shop.facebook_url ?? '',
    instagram_url: shop.instagram_url ?? '',
    website_url: shop.website_url ?? '',
    tiktok_url: shop.tiktok_url ?? '',
    youtube_url: shop.youtube_url ?? '',
    og_image_url: shop.og_image_url ?? null,
    og_image_public_id: shop.og_image_public_id ?? null,
    og_image_media_id: null,
    currency: shop.currency ?? 'XOF',
    language: shop.language ?? 'fr',
    timezone: shop.timezone ?? 'Africa/Porto-Novo',
    status: shop.status ?? 'ACTIVE',
    primary_color: shop.primary_color ?? '#d4643f',
    secondary_color: shop.secondary_color ?? '#00875A',
    accent_color: shop.accent_color ?? '#F5EFE6',
    background_color: shop.background_color ?? '#ffffff',
    text_color: shop.text_color ?? '#1B2A4A',
    show_banner: shop.show_banner ?? true,
    show_categories: shop.show_categories ?? true,
    show_featured_products: shop.show_featured_products ?? true,
    show_new_products: shop.show_new_products ?? true,
    show_reviews: shop.show_reviews ?? true,
    show_contact: shop.show_contact ?? true,
    show_social_links: shop.show_social_links ?? true,
    delivery_enabled: shop.delivery_enabled ?? false,
    delivery_fee: shop.delivery_fee?.toString() ?? '',
    free_delivery_threshold: shop.free_delivery_threshold?.toString() ?? '',
    pickup_enabled: shop.pickup_enabled ?? true,
    campus_delivery_enabled: shop.campus_delivery_enabled ?? true,
    local_delivery_enabled: shop.local_delivery_enabled ?? false,
    allow_guest_checkout: shop.allow_guest_checkout ?? true,
    allow_cancellation: shop.allow_cancellation ?? true,
    meta_title: shop.meta_title ?? '',
    meta_description: shop.meta_description ?? '',
    logo_url: shop.logo_url ?? null,
    banner_url: shop.banner_url ?? null,
    favicon_url: shop.favicon_url ?? null,
  })

  useEffect(() => {
    setSaved(false)
  }, [activeSection])

  const updateField = (field: string, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          delivery_fee: form.delivery_fee ? Number(form.delivery_fee) : null,
          free_delivery_threshold: form.free_delivery_threshold ? Number(form.free_delivery_threshold) : null,
        }

        const res = await fetch('/api/seller/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId: shop.id, ...payload }),
        })

        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Impossible d’enregistrer les paramètres.')
          return
        }

        setSaved(true)
        toast.success('Paramètres enregistrés avec succès.')
      } catch {
        toast.error('Erreur réseau. Réessaie plus tard.')
      }
    })
  }

  const sectionMeta = useMemo(() => ({
    general: { title: 'Informations générales', description: 'Nom, description, contacts et statut.' },
    appearance: { title: 'Apparence', description: 'Logo, bannière, couleurs et options d’affichage.' },
    delivery: { title: 'Livraison & retrait', description: 'Méthodes, frais et points de retrait.' },
    payments: { title: 'Paiements', description: 'Préférences de checkout et annulation.' },
    social: { title: 'Réseaux sociaux', description: 'Liens de contact et réseaux.' },
    seo: { title: 'SEO', description: 'Métadonnées pour la boutique.' },
  }), [])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSection(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-all ${activeSection === id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:border-primary/40'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <Card className="rounded-3xl border border-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{sectionMeta[activeSection as keyof typeof sectionMeta].title}</CardTitle>
              <p className="text-sm text-muted-foreground">{sectionMeta[activeSection as keyof typeof sectionMeta].description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeSection === 'general' && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nom de la boutique</Label>
                      <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input value={form.slug} onChange={(e) => updateField('slug', e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Email professionnel</Label>
                      <Input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={4} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nom du contact</Label>
                      <Input value={form.contact_name} onChange={(e) => updateField('contact_name', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone du contact</Label>
                      <Input value={form.contact_phone} onChange={(e) => updateField('contact_phone', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">En pause</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </>
              )}

              {activeSection === 'appearance' && (
                <>
                  <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Logo</Label>
                        <ImageUpload value={form.logo_url} onChange={(value) => updateField('logo_url', value)} bucket="shops" shopId={shop.id} />
                      </div>
                      <div className="space-y-2">
                        <Label>Bannière</Label>
                        <ImageUpload value={form.banner_url} onChange={(value) => updateField('banner_url', value)} bucket="shops" shopId={shop.id} />
                      </div>
                      <div className="space-y-2">
                        <Label>Favicon</Label>
                        <ImageUpload value={form.favicon_url} onChange={(value) => updateField('favicon_url', value)} bucket="shops" shopId={shop.id} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Couleur primaire</Label>
                        <Input type="color" value={form.primary_color ?? '#d4643f'} onChange={(e) => updateField('primary_color', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Couleur secondaire</Label>
                        <Input type="color" value={form.secondary_color ?? '#00875A'} onChange={(e) => updateField('secondary_color', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Accent</Label>
                        <Input type="color" value={form.accent_color ?? '#F5EFE6'} onChange={(e) => updateField('accent_color', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Texte</Label>
                        <Input type="color" value={form.text_color ?? '#1B2A4A'} onChange={(e) => updateField('text_color', e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Afficher la bannière</p>
                        <p className="text-sm text-muted-foreground">Activer la bannière sur la boutique</p>
                      </div>
                      <Switch checked={form.show_banner} onCheckedChange={(value) => updateField('show_banner', value)} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Afficher les catégories</p>
                        <p className="text-sm text-muted-foreground">Montrer les catégories sur la boutique</p>
                      </div>
                      <Switch checked={form.show_categories} onCheckedChange={(value) => updateField('show_categories', value)} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Produits mis en avant</p>
                        <p className="text-sm text-muted-foreground">Afficher la section featured</p>
                      </div>
                      <Switch checked={form.show_featured_products} onCheckedChange={(value) => updateField('show_featured_products', value)} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Nouveaux produits</p>
                        <p className="text-sm text-muted-foreground">Afficher les nouveautés</p>
                      </div>
                      <Switch checked={form.show_new_products} onCheckedChange={(value) => updateField('show_new_products', value)} />
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'delivery' && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Livraison activée</p>
                        <p className="text-sm text-muted-foreground">Autoriser la livraison</p>
                      </div>
                      <Switch checked={form.delivery_enabled} onCheckedChange={(value) => updateField('delivery_enabled', value)} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Frais de livraison</Label>
                        <Input type="number" min="0" value={form.delivery_fee} onChange={(e) => updateField('delivery_fee', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Seuil gratuité</Label>
                        <Input type="number" min="0" value={form.free_delivery_threshold} onChange={(e) => updateField('free_delivery_threshold', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="flex items-center justify-between rounded-xl border border-border p-3">
                        <p className="font-medium">Retrait</p>
                        <Switch checked={form.pickup_enabled} onCheckedChange={(value) => updateField('pickup_enabled', value)} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border p-3">
                        <p className="font-medium">Livraison campus</p>
                        <Switch checked={form.campus_delivery_enabled} onCheckedChange={(value) => updateField('campus_delivery_enabled', value)} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border p-3">
                        <p className="font-medium">Livraison locale</p>
                        <Switch checked={form.local_delivery_enabled} onCheckedChange={(value) => updateField('local_delivery_enabled', value)} />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'payments' && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Checkout invité</p>
                        <p className="text-sm text-muted-foreground">Autoriser les commandes sans connexion</p>
                      </div>
                      <Switch checked={form.allow_guest_checkout} onCheckedChange={(value) => updateField('allow_guest_checkout', value)} />
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border p-3">
                      <div>
                        <p className="font-medium">Annulation client</p>
                        <p className="text-sm text-muted-foreground">Permettre l’annulation avant préparation</p>
                      </div>
                      <Switch checked={form.allow_cancellation} onCheckedChange={(value) => updateField('allow_cancellation', value)} />
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'social' && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>WhatsApp</Label>
                      <Input value={form.whatsapp_url} onChange={(e) => updateField('whatsapp_url', e.target.value)} placeholder="https://wa.me/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Facebook</Label>
                      <Input value={form.facebook_url} onChange={(e) => updateField('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Instagram</Label>
                      <Input value={form.instagram_url} onChange={(e) => updateField('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Site web</Label>
                      <Input value={form.website_url} onChange={(e) => updateField('website_url', e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>TikTok</Label>
                      <Input value={form.tiktok_url} onChange={(e) => updateField('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@..." />
                    </div>
                    <div className="space-y-2">
                      <Label>YouTube</Label>
                      <Input value={form.youtube_url} onChange={(e) => updateField('youtube_url', e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                  </div>
                </>
              )}

              {activeSection === 'seo' && (
                <>
                  <div className="space-y-2">
                    <Label>Titre SEO</Label>
                    <Input value={form.meta_title} onChange={(e) => updateField('meta_title', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description SEO</Label>
                    <Textarea value={form.meta_description} onChange={(e) => updateField('meta_description', e.target.value)} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Image OG</Label>
                    <ImageUpload
                      value={form.og_image_url}
                      onChange={(value) => updateField('og_image_url', value)}
                      bucket="shops"
                      shopId={shop.id}
                      onMeta={async (meta) => {
                        // if removed
                        if (meta === null) {
                          // delete previous public id in DB already handled by API delete
                          updateField('og_image_public_id', null)
                          updateField('og_image_url', null)
                          updateField('og_image_media_id', null)
                          return
                        }

                        // if uploaded, meta.public_id contains the new id
                        try {
                          const previous = form.og_image_public_id
                          if (previous && previous !== meta.public_id) {
                            // attempt to delete previous public id on server
                            await fetch('/api/cloudinary/delete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ publicId: previous, shopId: shop.id }),
                            })
                          }
                        } catch (e) {
                          console.warn('Failed to delete previous OG image', e)
                        }

                        updateField('og_image_public_id', meta.public_id ?? null)
                        updateField('og_image_url', meta.url ?? null)
                        updateField('og_image_media_id', meta.mediaId ?? null)
                      }}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-4">
        <div>
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 size={16} />
              Modifications enregistrées
            </div>
          )}
        </div>
        <Button type="submit" disabled={isPending} className="min-w-[180px]">
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : 'Enregistrer les paramètres'}
        </Button>
      </div>
    </form>
  )
}
