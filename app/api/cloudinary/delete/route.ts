import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const CLOUDINARY_URL = process.env.CLOUDINARY_URL
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

function getCloudinaryCloudName() {
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'default') {
    return CLOUDINARY_CLOUD_NAME
  }

  if (!CLOUDINARY_URL) return undefined

  try {
    const url = new URL(CLOUDINARY_URL)
    if (url.protocol === 'cloudinary:') return url.hostname
    const segments = url.pathname.split('/').filter(Boolean)
    const v1Index = segments.findIndex((segment) => segment === 'v1_1')
    if (v1Index >= 0 && segments.length > v1Index + 1) return segments[v1Index + 1]
    return segments.length > 0 ? segments[segments.length - 1] : undefined
  } catch {
    return undefined
  }
}

async function configureCloudinaryAndGetClient(cloudName: string) {
  const originalCloudinaryUrl = process.env.CLOUDINARY_URL
  if (originalCloudinaryUrl && !originalCloudinaryUrl.startsWith('cloudinary://')) {
    delete process.env.CLOUDINARY_URL
  }

  const { v2: cloudinary } = await import('cloudinary')

  if (originalCloudinaryUrl && !originalCloudinaryUrl.startsWith('cloudinary://')) {
    process.env.CLOUDINARY_URL = originalCloudinaryUrl
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })

  return cloudinary
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  try {
    const body = await req.json()
    const { publicId, shopId } = body

    if (!publicId || !shopId) {
      return NextResponse.json({ error: 'publicId et shopId requis.' }, { status: 400 })
    }

    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) return NextResponse.json({ error: 'Vendeur introuvable.' }, { status: 403 })

    const shop = await prisma.shop.findUnique({ where: { id: shopId } })
    if (!shop || shop.seller_id !== seller.id) {
      return NextResponse.json({ error: 'Boutique introuvable ou accès refusé.' }, { status: 404 })
    }

    const cloudName = getCloudinaryCloudName()
    if (!cloudName) return NextResponse.json({ error: 'Configuration Cloudinary manquante.' }, { status: 500 })

    const cloudinary = await configureCloudinaryAndGetClient(cloudName)

    // destroy the resource. use invalidate to clear cached CDN
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { invalidate: true }, (err: any, res: any) => {
        if (err) return reject(err)
        resolve(res)
      })
    })

    // If deletion succeeded, clear any matching references in DB (best-effort)
    try {
      await prisma.shop.updateMany({
        where: { id: shopId, og_image_public_id: publicId },
        data: { og_image_public_id: null, og_image_url: null },
      })
    } catch (e) {
      console.warn('Failed to clear DB reference for deleted media', e)
    }

    // Also remove any StoreMedia entries that match this public_id and shop
    try {
      const deleted = await prisma.storeMedia.deleteMany({ where: { public_id: publicId, shop_id: shopId } })
      // include deleted count in response
      return NextResponse.json({ success: true, result, deletedMediaCount: deleted.count })
    } catch (e) {
      console.warn('Failed to delete StoreMedia record', e)
      return NextResponse.json({ success: true, result, deletedMediaCount: 0 })
    }
    
  } catch (error: any) {
    console.error('Cloudinary delete error:', error)
    return NextResponse.json({ error: error?.message || 'Erreur suppression Cloudinary' }, { status: 500 })
  }
}
