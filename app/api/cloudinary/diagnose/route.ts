import { NextResponse } from 'next/server'

const CLOUDINARY_URL = process.env.CLOUDINARY_URL
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

function detectCloudName(): string | undefined {
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_CLOUD_NAME !== 'default') return CLOUDINARY_CLOUD_NAME
  if (!CLOUDINARY_URL) return undefined
  try {
    const url = new URL(CLOUDINARY_URL)
    if (url.protocol === 'cloudinary:') return url.hostname
    const segments = url.pathname.split('/').filter(Boolean)
    const v1Index = segments.findIndex((s) => s === 'v1_1')
    if (v1Index >= 0 && segments.length > v1Index + 1) return segments[v1Index + 1]
    return segments.length > 0 ? segments[segments.length - 1] : undefined
  } catch {
    return undefined
  }
}

export async function GET() {
  const cloudName = detectCloudName()
  const urlFormatValid = typeof CLOUDINARY_URL === 'string' && CLOUDINARY_URL.startsWith('cloudinary://')
  const hasPreset = Boolean(CLOUDINARY_UPLOAD_PRESET)
  const hasCredentials = Boolean(CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)

  return NextResponse.json({
    cloudName: cloudName ?? null,
    cloudinaryUrl: CLOUDINARY_URL ?? null,
    cloudinaryUrlFormatValid: urlFormatValid,
    hasUploadPreset: hasPreset,
    uploadPreset: CLOUDINARY_UPLOAD_PRESET ?? null,
    hasApiCredentials: hasCredentials,
    apiKeyConfigured: Boolean(CLOUDINARY_API_KEY),
    apiSecretConfigured: Boolean(CLOUDINARY_API_SECRET),
    recommendedAction: hasCredentials
      ? 'Preferred: use signed server-side uploads (CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET present).'
      : hasPreset
      ? 'Unsigned upload available: ensure preset exists and is set to allow unsigned uploads.'
      : 'No upload method configured: add CLOUDINARY_UPLOAD_PRESET or API credentials in .env',
  })
}
