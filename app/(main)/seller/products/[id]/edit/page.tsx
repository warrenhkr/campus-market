'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedSection } from '@/components/AnimatedSection'
import { ImageUpload } from '@/components/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category { id: string; name: string }

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [isPending, startTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [productRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').eq('id', id).single(),
        supabase.from('categories').select('id, name').order('name'),
      ])

      if (productRes.data) {
        const p = productRes.data
        setName(p.name)
        setDescription(p.description ?? '')
        setPrice(String(p.price))
        setStock(String(p.stock))
        setCategoryId(p.category_id ?? '')
        setImageUrl(p.image_url ?? null)
        setIsAvailable(p.is_available)
      }
      if (categoriesRes.data) setCategories(categoriesRes.data)
      setLoading(false)
    }
    load()
  }, [id, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Nom requis')
    if (!price || Number(price) <= 0) return toast.error('Prix invalide')

    startTransition(async () => {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, price: Number(price),
          stock: Number(stock), category_id: categoryId || null,
          image_url: imageUrl, is_available: isAvailable,
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Produit mis à jour ✅')
      router.push('/seller/products')
    })
  }

  const handleDelete = () => {
    if (!confirm('Supprimer ce produit définitivement ?')) return
    startDeleteTransition(async () => {
      const res = await fetch(`/api/seller/products/${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur lors de la suppression'); return }
      toast.success('Produit supprimé')
      router.push('/seller/products')
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--primary)', animationDelay: `${i*0.15}s` }} />
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/products"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Modifier le produit
            </h1>
          </div>
          <button onClick={handleDelete} disabled={isDeletePending}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
              transition-all hover:scale-105"
            style={{ background: '#F8717118', color: '#F87171' }}>
            <Trash2 size={13} />
            Supprimer
          </button>
        </div>
      </AnimatedSection>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">
            <AnimatedSection delay={0.1}>
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}>
                  <Package size={15} style={{ color: 'var(--primary)' }} />
                  Informations
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Nom <span style={{ color: 'var(--primary)' }}>*</span>
                    </label>
                    <Input value={name} onChange={e => setName(e.target.value)}
                      className="h-10" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Description
                    </label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      rows={4} className="w-full px-3 py-2.5 text-sm rounded-xl outline-none resize-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Catégorie
                    </label>
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                      <option value="">Sans catégorie</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  Prix & Stock
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Prix (FCFA) *
                    </label>
                    <Input value={price} onChange={e => setPrice(e.target.value)}
                      type="number" min="1" className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Stock
                    </label>
                    <Input value={stock} onChange={e => setStock(e.target.value)}
                      type="number" min="0" className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isAvailable}
                    onChange={e => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                    Produit visible sur la marketplace
                  </span>
                </label>
              </div>
            </AnimatedSection>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <AnimatedSection delay={0.1}>
              <div className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                  Image
                </h2>
                <ImageUpload value={imageUrl} onChange={setImageUrl} bucket="products" />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button type="submit" disabled={isPending} className="w-full h-12 font-bold text-sm"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Mise à jour...
                    </span>
                  ) : 'Sauvegarder les modifications'}
                </Button>
              </motion.div>
            </AnimatedSection>
          </div>
        </div>
      </form>
    </div>
  )
}