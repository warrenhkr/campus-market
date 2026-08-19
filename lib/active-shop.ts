import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export const ACTIVE_SHOP_COOKIE = 'active_shop_id'

/**
 * Retourne la boutique "active" du vendeur connecté, pour les vendeurs
 * gérant plusieurs boutiques. Lit le cookie de préférence (posé par
 * ShopSwitcher), vérifie qu'il correspond bien à une boutique du vendeur
 * (jamais confiance à un id de boutique arbitraire), et retombe sur la
 * première boutique du vendeur si absent, invalide, ou n'appartenant pas
 * à ce vendeur.
 */
export async function getActiveShop(userId: string) {
  const seller = await prisma.seller.findUnique({
    where: { user_id: userId },
    include: { shops: { orderBy: { created_at: 'asc' } } },
  })
  if (!seller || seller.shops.length === 0) {
    return { seller: null, shop: null, shops: [] }
  }

  const cookieStore = await cookies()
  const preferredId = cookieStore.get(ACTIVE_SHOP_COOKIE)?.value
  const preferred = preferredId ? seller.shops.find((shop) => shop.id === preferredId) : undefined

  return { seller, shop: preferred ?? seller.shops[0], shops: seller.shops }
}
