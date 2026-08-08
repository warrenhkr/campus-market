'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AnimatedCard } from '@/components/AnimatedCard'
import { Eye, EyeOff, Edit, Package } from 'lucide-react'

interface Category { id: string; name: string }

interface ProductProps {
  product: any
  index?: number
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  APPROVED:       { label: 'Approuvé',    color: '#10B981' },
  PENDING_REVIEW: { label: 'En attente', color: '#F59E0B' },
  REJECTED:       { label: 'Rejeté',     color: '#F87171' },
  HIDDEN:         { label: 'Masqué',     color: '#888888' },
}

export default function ProductCard({ product, index = 0 }: ProductProps) {
  const status = STATUS_MAP[product.status] ?? STATUS_MAP.PENDING_REVIEW

  return (
    <AnimatedCard index={index}>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="relative flex items-center justify-center" style={{ aspectRatio: '16/9', background: 'var(--surface-2)' }}>
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
          ) : (
            <Package size={32} style={{ color: 'var(--subtle)' }} />
          )}

          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${status.color}22`, color: status.color }}>
            {status.label}
          </div>

          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{ background: product.is_available ? '#10B98122' : '#88888822', color: product.is_available ? '#10B981' : '#888888' }}>
            {product.is_available ? <><Eye size={10} /> Visible</> : <><EyeOff size={10} /> Masqué</>}
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm font-semibold mb-1 line-clamp-1" style={{ color: 'var(--foreground)' }}>{product.name}</p>

          <div className="flex items-center justify-between mb-3">
            <p className="text-base font-bold" style={{ color: 'var(--primary)' }}>{new Intl.NumberFormat('fr-FR').format(Number(product.price))} FCFA</p>
            <span className="text-xs" style={{ color: 'var(--subtle)' }}>Stock: {product.stock}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.category && (
              <p className="text-xs" style={{ color: 'var(--subtle)' }}>{product.category.name}</p>
            )}
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium" style={{ borderColor: 'var(--border)', color: 'var(--subtle)' }}>
              {product.type === 'DIGITAL' ? 'Numérique' : 'Physique'}
            </span>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 py-2 text-xs">
              <Link href={`/seller/products/${product.id}/edit`} className="flex items-center gap-1.5 justify-center">
                <Edit size={12} /> Modifier
              </Link>
            </Button>

            <Button asChild variant="ghost" className="px-3 py-2 text-xs">
              <Link href={`/products/${product.id}`}>
                <Eye size={12} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}
