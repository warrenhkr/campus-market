'use client'

import { useState } from 'react'
import { AddToCartButton } from '@/components/AddToCartButton'

interface PricingTier {
  id: string
  label: string
  price: number
  is_default: boolean
}

interface ProductVariant {
  id: string
  name: string
  price_delta: number
  stock_delta: number
  is_active: boolean
}

interface ProductPurchaseOptionsProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock: number
    stock_mode: 'UNLIMITED' | 'TRACKED' | 'PREORDER' | 'OUT_OF_STOCK'
    shop_id: string
    shop_name: string
    shop_slug: string
    type: 'PHYSICAL' | 'DIGITAL'
    auto_discount?: { enabled: boolean; type: 'FIXED' | 'PERCENT'; value: number } | null
  }
  pricingTiers: PricingTier[]
  variants: ProductVariant[]
  canPurchase?: boolean
  accessMessage?: string | null
}

export function ProductPurchaseOptions({ product, pricingTiers, variants, canPurchase = true, accessMessage }: ProductPurchaseOptionsProps) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(() => {
    const defaultTier = pricingTiers.find((tier) => tier.is_default) ?? pricingTiers[0]
    return defaultTier?.id ?? null
  })

  const selectedTier = pricingTiers.find((tier) => tier.id === selectedTierId)
  const activeVariants = variants.filter((variant) => variant.is_active)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(activeVariants[0]?.id ?? null)
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId)
  const selectedStock = Math.max(0, product.stock + (selectedVariant?.stock_delta ?? 0))
  const canPurchaseStock = product.stock_mode === 'UNLIMITED' || product.stock_mode === 'PREORDER' || selectedStock > 0
  const selectedProduct = {
    ...product,
    price: (selectedTier?.price ?? product.price) + (selectedVariant?.price_delta ?? 0),
    stock: canPurchaseStock ? Math.max(1, selectedStock) : 0,
    pricing_tier_id: selectedTier?.id ?? null,
    pricing_tier_label: selectedTier?.label ?? null,
    variant_id: selectedVariant?.id ?? null,
    variant_name: selectedVariant?.name ?? null,
    auto_discount: product.auto_discount ?? null,
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {pricingTiers.length > 0 && (
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Choisir un tarif</span>
          <select
            value={selectedTierId ?? ''}
            onChange={(event) => setSelectedTierId(event.target.value || null)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
          >
            <option value="">Tarif standard · {new Intl.NumberFormat('fr-FR').format(product.price)} FCFA</option>
            {pricingTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label} · {new Intl.NumberFormat('fr-FR').format(tier.price)} FCFA
              </option>
            ))}
          </select>
        </label>
      )}
      {variants.length > 0 && (
        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Choisir une variante</span>
          <select
            value={selectedVariantId ?? ''}
            onChange={(event) => setSelectedVariantId(event.target.value || null)}
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none"
          >
            {activeVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name} · {variant.price_delta >= 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(variant.price_delta)} FCFA
                {product.stock_mode === 'TRACKED' ? ` · ${Math.max(0, product.stock + variant.stock_delta)} disponible(s)` : ''}
              </option>
            ))}
          </select>
        </label>
      )}
      {!canPurchase && accessMessage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{accessMessage}</p>
      ) : (
        <AddToCartButton product={selectedProduct} />
      )}
    </div>
  )
}
