'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AnimatedSection } from '@/components/AnimatedSection'
import { ImageUpload } from '@/components/ImageUpload'
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
  const [productType, setProductType] = useState<'PHYSICAL' | 'DIGITAL'>('PHYSICAL')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Charge les catégories depuis l'API serveur
  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/user')
      if (!res.ok) {
        router.push('/login')
        return
      }

      const userJson = await res.json()
      if (!userJson.profile) {
        router.push('/login')
        return
      }

      const categoriesRes = await fetch('/api/categories')
      if (!categoriesRes.ok) return
      const categoriesData = await categoriesRes.json()
      setCategories(categoriesData.categories ?? [])
    }

    load()
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return toast.error('Nom du produit requis')
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return toast.error('Prix invalide')
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/seller/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description,
            price: Number(price),
            stock: Number(stock),
            category_id: categoryId === '' ? null : categoryId,
            image_url: imageUrl,
            type: productType,
          }),
        })

        if (res.status === 401) {
          router.push('/login')
          return
        }

        if (!res.ok) {
          toast.error('Impossible de créer le produit')
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
          <Button asChild variant="outline" size="icon"
            className="w-9 h-9 rounded-xl"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <Link href="/seller/products">
              <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
            </Link>
          </Button>
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
              <Card className="rounded-3xl border border-border">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--surface-2)' }}>
                      <Package size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <CardTitle className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}>
                      Informations du produit
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décris ton produit en détail..."
                      rows={4}
                      className="rounded-xl resize-none text-sm px-3 py-2.5"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}>
                        Type de produit
                      </label>
                      <select
                        value={productType}
                        onChange={(e) => setProductType(e.target.value as 'PHYSICAL' | 'DIGITAL')}
                        className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-colors hover:border-primary/70"
                        style={{
                          background: 'var(--surface-2)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <option value="PHYSICAL">Physique</option>
                        <option value="DIGITAL">Numérique</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium"
                        style={{ color: 'var(--muted-foreground)' }}>
                        Catégorie
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none transition-colors hover:border-primary/70"
                        style={{
                          background: 'var(--surface-2)',
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
              </CardContent>
            </Card>
            </AnimatedSection>

            {/* Prix & Stock */}
            <AnimatedSection delay={0.15}>
              <Card className="rounded-3xl border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold"
                    style={{ color: 'var(--foreground)' }}>
                    Prix & Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Image + Submit */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image */}
            <AnimatedSection delay={0.1}>
              <Card className="rounded-3xl border border-border p-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: 'var(--surface-2)' }}>
                      <Package size={18} style={{ color: 'var(--primary)' }} />
                    </div>
                    <CardTitle className="text-sm font-semibold"
                      style={{ color: 'var(--foreground)' }}>
                      Image du produit
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    bucket="products"
                  />
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Submit */}
            <AnimatedSection delay={0.2}>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 font-bold text-sm shadow-[0_0_25px_rgba(59,130,246,0.18)]"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Publication en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Plus size={16} /> Publier le produit
                    </span>
                  )}
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