import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ShippingOptionZone {
  id: string
  name: string
  fee: number | null
  estimated_min_days: number | null
  estimated_max_days: number | null
}

interface ShopShippingOptions {
  shop_id: string
  shop_name: string
  has_physical_items: boolean
  pickup_available: boolean
  pickup_location: string | null
  delivery_enabled: boolean
  delivery_fee: number | null
  free_delivery_threshold: number | null
  zones: ShippingOptionZone[]
}

export async function POST(req: NextRequest) {
  const { productIds } = await req.json()

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ shops: [] })
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds.filter((id): id is string => typeof id === 'string') } },
    select: {
      id: true,
      type: true,
      metadata: true,
      shop: { select: { id: true, name: true } },
      delivery_zones: {
        where: { is_active: true },
        orderBy: { position: 'asc' },
        select: { id: true, name: true, fee: true, estimated_min_days: true, estimated_max_days: true },
      },
    },
  })

  const byShop = new Map<string, ShopShippingOptions>()

  for (const product of products) {
    if (!product.shop) continue
    const metadata = (product.metadata ?? {}) as {
      pickup?: { available?: boolean; location?: string | null }
      delivery?: { enabled?: boolean; fee?: number | null; freeThreshold?: number | null }
    }

    const existing = byShop.get(product.shop.id)
    const zones: ShippingOptionZone[] = product.delivery_zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      fee: zone.fee != null ? Number(zone.fee) : null,
      estimated_min_days: zone.estimated_min_days,
      estimated_max_days: zone.estimated_max_days,
    }))

    if (existing) {
      existing.has_physical_items = existing.has_physical_items || product.type === 'PHYSICAL'
      existing.pickup_available = existing.pickup_available || !!metadata.pickup?.available
      existing.delivery_enabled = existing.delivery_enabled || !!metadata.delivery?.enabled
      // Fusionne les zones sans doublon (un produit peut redéfinir les mêmes zones)
      const knownIds = new Set(existing.zones.map((z) => z.id))
      for (const zone of zones) {
        if (!knownIds.has(zone.id)) existing.zones.push(zone)
      }
    } else {
      byShop.set(product.shop.id, {
        shop_id: product.shop.id,
        shop_name: product.shop.name,
        has_physical_items: product.type === 'PHYSICAL',
        pickup_available: !!metadata.pickup?.available,
        pickup_location: metadata.pickup?.location ?? null,
        delivery_enabled: !!metadata.delivery?.enabled,
        delivery_fee: metadata.delivery?.fee ?? null,
        free_delivery_threshold: metadata.delivery?.freeThreshold ?? null,
        zones,
      })
    }
  }

  return NextResponse.json({ shops: Array.from(byShop.values()) })
}
