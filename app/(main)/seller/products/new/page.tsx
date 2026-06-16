'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedSection } from '@/components/AnimatedSection'
import { ImageUpload } from '@/components/ImageUpload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('1')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Charge les catégories
  useState(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('categories').select('id, name').order('name')
      if (data) setCategories(data)
    }
    load()
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return toast.error('Nom du produit requis')
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return toast.error('Prix invalide')
    }

    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const res = await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            category_id: categoryId || null,
            image_url: imageUrl,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? 'Erreur lors de la création')
          return
        }

        toast.success('Produit créé avec succès ✅')
        router.push('/seller/products')
      } catch {
        toast.error('Une erreur est survenue')
      }
    })
  }

  return (
    <div>
      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/seller/products"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Nouveau produit
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Remplis les informations de ton produit
            </p>
          </div>
        </div>
      </AnimatedSection>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Formulaire */}
          <div className="lg:col-span-3 space-y-5">

            {/* Infos principales */}
            <AnimatedSection delay={0.1}>
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}>
                  <Package size={15} style={{ color: 'var(--primary)' }} />
                  Informations du produit
                </h2>

                <div className="space-y-4">
                  {/* Nom */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Nom du produit <span style={{ color: 'var(--primary)' }}>*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Calculatrice scientifique Casio"
                      required
                      className="h-10"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décris ton produit en détail..."
                      rows={4}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none resize-none"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  {/* Catégorie */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Catégorie
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    >
                      <option value="">Sans catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Prix & Stock */}
            <AnimatedSection delay={0.15}>
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-4"
                  style={{ color: 'var(--foreground)' }}>
                  Prix & Stock
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Prix (FCFA) <span style={{ color: 'var(--primary)' }}>*</span>
                    </label>
                    <Input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      type="number"
                      min="1"
                      required
                      className="h-10"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium"
                      style={{ color: 'var(--muted-foreground)' }}>
                      Stock disponible
                    </label>
                    <Input
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="1"
                      type="number"
                      min="0"
                      className="h-10"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Image + Submit */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image */}
            <AnimatedSection delay={0.1}>
              <div
                className="rounded-2xl p-6"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-4"
                  style={{ color: 'var(--foreground)' }}>
                  Image du produit
                </h2>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  bucket="products"
                />
              </div>
            </AnimatedSection>

            {/* Submit */}
            <AnimatedSection delay={0.2}>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 font-bold text-sm"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    boxShadow: '0 0 20px rgba(163,230,53,0.15)',
                  }}
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Création en cours...
                    </span>
                  ) : 'Publier le produit'}
                </Button>
              </motion.div>

              <p className="text-xs text-center mt-3" style={{ color: 'var(--subtle)' }}>
                Le produit sera examiné avant d&apos;être publié.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </form>
    </div>
  )
}