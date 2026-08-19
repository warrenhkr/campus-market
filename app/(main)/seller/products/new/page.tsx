'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/AnimatedSection'
import { ProductBuilderForm } from '@/components/seller/ProductBuilderForm'

interface Category {
  id: string
  name: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [shopSlug, setShopSlug] = useState<string>('')

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
        const res = await fetch('/api/user')
        if (!res.ok) {
          router.push('/login')
          return
        }

        const userJson = await parseJsonSafe(res)
        if (!userJson?.profile) {
          router.push('/login')
          return
        }

        const categoriesRes = await fetch('/api/categories')
        if (!categoriesRes.ok) return
        const categoriesData = await parseJsonSafe(categoriesRes)
        setCategories(categoriesData?.categories ?? [])

        const shopsRes = await fetch('/api/seller/settings')
        if (shopsRes.ok) {
          const shopsData = await parseJsonSafe(shopsRes)
          setShopSlug(shopsData?.shops?.[0]?.slug ?? '')
        }
      } catch (err) {
        // network or unexpected error — redirect to login as a safe fallback
        console.error('Load new product page error:', err)
        router.push('/login')
      }
    }

    load()
  }, [router])

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
              Nouveau produit
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Crée un produit complet et construis ta page de vente.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <ProductBuilderForm
        categories={categories}
        apiEndpoint="/api/seller/products"
        method="POST"
        submitLabel="Publier le produit"
        shopSlug={shopSlug}
        onSuccess={() => router.push('/seller/products')}
      />
    </div>
  )
}