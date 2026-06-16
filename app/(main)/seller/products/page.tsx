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
    return seller
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
          {allProducts.map((product, i) => {
            const status = STATUS_MAP[product.status] ?? STATUS_MAP.PENDING_REVIEW
            const StatusIcon = status.icon

            return (
              <AnimatedCard key={product.id} index={i}>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {/* Image */}
                  <div
                    className="relative flex items-center justify-center"
                    style={{ aspectRatio: '16/9', background: 'var(--surface-2)' }}
                  >
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package size={32} style={{ color: 'var(--subtle)' }} />
                    )}

                    {/* Status badge */}
                    <div
                      className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1
                        rounded-full text-xs font-semibold"
                      style={{ background: `${status.color}22`, color: status.color }}
                    >
                      <StatusIcon size={10} />
                      {status.label}
                    </div>

                    {/* Available toggle */}
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1
                        rounded-full text-xs font-semibold"
                      style={{
                        background: product.is_available ? '#10B98122' : '#88888822',
                        color: product.is_available ? '#10B981' : '#888888',
                      }}
                    >
                      {product.is_available
                        ? <><Eye size={10} /> Visible</>
                        : <><EyeOff size={10} /> Masqué</>
                      }
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm font-semibold mb-1 line-clamp-1"
                      style={{ color: 'var(--foreground)' }}>
                      {product.name}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>
                        {new Intl.NumberFormat('fr-FR').format(Number(product.price))} FCFA
                      </p>
                      <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    {product.category && (
                      <p className="text-xs mb-3" style={{ color: 'var(--subtle)' }}>
                        {product.category.name}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/seller/products/${product.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                          text-xs font-semibold transition-all hover:scale-105"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <Edit size={12} />
                        Modifier
                      </Link>
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center justify-center px-3 py-2 rounded-xl
                          text-xs transition-all hover:scale-105"
                        style={{
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <Eye size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            )
          })}
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