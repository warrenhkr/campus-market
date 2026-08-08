import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatedSection } from '@/components/AnimatedSection'
import { AnimatedCard } from '@/components/AnimatedCard'
import {
  Plus, Package, Eye, EyeOff,
  Edit, CheckCircle, Clock, XCircle,
} from 'lucide-react'
import ProductCard from '@/components/seller/ProductCard'

function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
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

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  APPROVED:       { label: 'Approuvé',    color: '#10B981', icon: CheckCircle },
  PENDING_REVIEW: { label: 'En attente', color: '#F59E0B', icon: Clock },
  REJECTED:       { label: 'Rejeté',     color: '#F87171', icon: XCircle },
  HIDDEN:         { label: 'Masqué',     color: '#888888', icon: EyeOff },
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
              <Plus size={16} />
              Ajouter un produit
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}