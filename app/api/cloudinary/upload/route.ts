import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

const CLOUDINARY_URL = process.env.CLOUDINARY_URL
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

function getCloudinaryCloudName() {
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'default') {
    return CLOUDINARY_CLOUD_NAME
  }

  if (!CLOUDINARY_URL) {
    return undefined
  }

  try {
    const url = new URL(CLOUDINARY_URL)
    if (url.protocol === 'cloudinary:') {
      return url.hostname
    }

    const segments = url.pathname.split('/').filter(Boolean)
    const v1Index = segments.findIndex((segment) => segment === 'v1_1')
    if (v1Index >= 0 && segments.length > v1Index + 1) {
      return segments[v1Index + 1]
    }

    return segments.length > 0 ? segments[segments.length - 1] : undefined
  } catch {
    return undefined
  }
}

function hasSignedCloudinaryCredentials() {
  return Boolean(CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
}

async function configureCloudinaryAndGetClient(cloudName: string) {
  // Dynamically import the Cloudinary SDK to avoid top-level evaluation that
  // throws when `CLOUDINARY_URL` is present but not in the `cloudinary://` format.
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

interface CloudinaryUploadResult {
  public_id: string
  secure_url?: string
  url?: string
  resource_type?: string
  format?: string
  width?: number
  height?: number
  bytes?: number
}

async function uploadSigned(buffer: Buffer, folder: string, cloudName: string, resourceType: string) {
  const cloudinary = await configureCloudinaryAndGetClient(cloudName)

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const options: Record<string, string> = { folder, resource_type: resourceType }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error)
      resolve(result as CloudinaryUploadResult)
    })

    uploadStream.end(buffer)
  })
}

export async function POST(req: NextRequest) {
  const cloudName = getCloudinaryCloudName()
  if (!cloudName) {
    return NextResponse.json(
      { error: 'La configuration Cloudinary est manquante. Définis CLOUDINARY_CLOUD_NAME ou CLOUDINARY_URL.' },
      { status: 500 }
    )
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const folder = formData.get('folder')?.toString() ?? 'products'
  const shopId = formData.get('shopId')?.toString() ?? null
  const uploaderId = formData.get('uploaderId')?.toString() ?? null

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = file.name || 'upload'
  const mimeType = file.type || 'application/octet-stream'
  const resourceType = mimeType.startsWith('video/') ? 'video' : 'image'

  if (hasSignedCloudinaryCredentials()) {
    try {
      const result = await uploadSigned(buffer, folder, cloudName, resourceType)
      const resultUrl = result.secure_url ?? result.url
      if (!resultUrl) {
        throw new Error('Cloudinary n’a renvoyé aucune URL pour le fichier uploadé.')
      }
      // Persist media metadata in the database when possible
      let mediaRecord = null
      try {
        mediaRecord = await prisma.storeMedia.create({
          data: {
            shop_id: shopId,
            uploader_id: uploaderId,
            public_id: result.public_id,
            url: resultUrl,
            resource_type: result.resource_type ?? resourceType,
            format: result.format ?? '',
            width: result.width ?? null,
            height: result.height ?? null,
            bytes: result.bytes ?? null,
          },
        })
      } catch (e) {
        console.warn('Failed to persist StoreMedia:', e)
      }

      return NextResponse.json({
        url: resultUrl,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        mediaId: mediaRecord?.id ?? null,
      })
    } catch (error: unknown) {
      console.error('Cloudinary signed upload error:', error)
      const message = error instanceof Error ? error.message : 'Échec de l’upload Cloudinary avec identifiants.'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    return NextResponse.json(
      {
        error:
          'Le preset Cloudinary est manquant. Configure CLOUDINARY_UPLOAD_PRESET, ou ajoute CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET pour un upload signé.',
      },
      { status: 500 }
    )
  }

  const unsignedForm = new FormData()
  unsignedForm.append('file', new Blob([buffer], { type: mimeType }), fileName)
  unsignedForm.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  unsignedForm.append('folder', folder)
  unsignedForm.append('resource_type', resourceType)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: unsignedForm,
  })

  const result = await response.json()
  if (!response.ok) {
    console.error('Cloudinary unsigned upload error:', result)
    // Return the raw Cloudinary error object when available to aid debugging
    return NextResponse.json(
      { error: result.error || result },
      { status: response.status || 500 }
    )
  }
  
  // Persist media metadata in the database when possible
  let mediaRecord = null
  try {
    mediaRecord = await prisma.storeMedia.create({
      data: {
        shop_id: shopId,
        uploader_id: uploaderId,
        public_id: result.public_id,
        url: result.secure_url ?? result.url,
        resource_type: result.resource_type,
        format: result.format,
        width: result.width ?? null,
        height: result.height ?? null,
        bytes: result.bytes ?? null,
      },
    })
  } catch (e) {
    console.warn('Failed to persist StoreMedia:', e)
  }

  return NextResponse.json({
    url: result.secure_url ?? result.url,
    public_id: result.public_id,
    resource_type: result.resource_type,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    mediaId: mediaRecord?.id ?? null,
  })
}
