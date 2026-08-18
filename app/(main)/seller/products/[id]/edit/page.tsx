'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/AnimatedSection'
import { ProductBuilderForm } from '@/components/seller/ProductBuilderForm'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

type SellerProduct = Record<string, unknown> & {
  id: string
} & import('@/components/seller/ProductBuilderForm').ProductBuilderInitialData

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<SellerProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeletePending, setIsDeletePending] = useState(false)

  useEffect(() => {
    const parseJsonSafe = async (response: Response) => {
      try {
        return await response.json()
      } catch {
        return null
      }
    }

    const load = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/seller/products/${id}`),
          fetch('/api/categories'),
        ])

        if (!productRes.ok) {
          router.push('/seller/products')
          return
        }

        const productJson = await parseJsonSafe(productRes)
        if (!productJson?.product) {
          router.push('/seller/products')
          return
        }

        setProduct(productJson.product)

        if (categoriesRes.ok) {
          const categoriesJson = await parseJsonSafe(categoriesRes)
          setCategories(categoriesJson?.categories ?? [])
        }
      } catch {
        router.push('/seller/products')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, router])

  const handleDelete = async () => {
    if (!confirm('Supprimer ce produit définitivement ?')) return
    setIsDeletePending(true)
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression')
        return
      }
      toast.success('Produit supprimé')
      router.push('/seller/products')
    } finally {
      setIsDeletePending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: 'var(--primary)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
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
              Modifier le produit
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Mets à jour les informations et ta page de vente.
            </p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeletePending} className="ml-auto">
            <Trash2 size={14} /> Supprimer
          </Button>
        </div>
      </AnimatedSection>

      {product ? (
        <ProductBuilderForm
          categories={categories}
          apiEndpoint={`/api/seller/products/${id}`}
          method="PATCH"
          submitLabel="Sauvegarder les modifications"
          initialData={product}
          shopSlug={(product.shop as { slug?: string } | undefined)?.slug ?? ''}
          onSuccess={() => router.push('/seller/products')}
        />
      ) : null}
    </div>
  )
}