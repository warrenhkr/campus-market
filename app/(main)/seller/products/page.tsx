import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { AnimatedSection } from '@/components/AnimatedSection'
import { PlusIcon } from '@/components/ServerIcons'

const Plus = PlusIcon
import ProductCard from '@/components/seller/ProductCard'

function serializeProduct(product: {
  id: string
  name: string
  price: unknown
  stock: number
  status: string
  is_available: boolean
  image_url: string | null
  type: 'PHYSICAL' | 'DIGITAL'
  category: { id: string; name: string } | null
  created_at: Date | string
  updated_at: Date | string
  [key: string]: unknown
}) {
  // Convertir tous les Decimal en nombre
  const convertDecimal = (value: unknown): unknown => {
    if (value && typeof value === 'object' && 'd' in value) {
      // Decimal object de Prisma
      return Number(value)
    }
    return value
  }

  return {
    ...product,
    price: Number(product.price),
    original_price: convertDecimal(product.original_price),
    delivery_fee: convertDecimal(product.delivery_fee),
    free_delivery_threshold: convertDecimal(product.free_delivery_threshold),
    created_at: product.created_at instanceof Date ? product.created_at.toISOString() : product.created_at,
    updated_at: product.updated_at instanceof Date ? product.updated_at.toISOString() : product.updated_at,
  }
}

async function getSellerProducts(userId: string) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { user_id: userId },
      include: {
        shops: {
          include: {
            products: {
              include: { category: true },
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
    })

    if (!seller) return null

    return {
      ...seller,
      shops: seller.shops.map((shop) => ({
        ...shop,
        products: shop.products.map(serializeProduct),
      })),
    }
  } catch {
    return null
  }
}

export default async function SellerProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const seller = await getSellerProducts(user.id)
  if (!seller) redirect('/become-seller')

  const allProducts = seller.shops.flatMap(s => s.products)

  return (
    <div>
      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Mes produits
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {allProducts.length} produit{allProducts.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Link
            href="/seller/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold
              transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <Plus size={16} />
            Ajouter
          </Link>
        </div>
      </AnimatedSection>

      {allProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-5xl mb-4">📦</p>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Aucun produit pour l&apos;instant
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Ajoute ton premier produit pour commencer à vendre.
            </p>
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                text-sm font-bold transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <PlusIcon size={16} />
              Ajouter un produit
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}