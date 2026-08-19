import { z } from 'zod'

const optionalString = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null
  return typeof value === 'string' ? value : String(value)
}, z.string().trim().max(255).nullable().optional())

const optionalUrl = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null
  return typeof value === 'string' ? value : String(value)
}, z.string().trim().url('URL invalide').nullable().optional())

const optionalColor = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null
  return typeof value === 'string' ? value : String(value)
}, z.string().trim().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Couleur invalide').nullable().optional())

const optionalDecimal = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return value
}, z.number().nonnegative('Valeur invalide').nullable().optional())

export const shopSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Nom de la boutique requis').max(120),
  slug: z.string().trim().min(2, 'Slug requis').max(80).regex(/^[a-z0-9-]+$/, 'Slug invalide'),
  description: optionalString,
  email: optionalString,
  phone: optionalString,
  contact_name: optionalString,
  contact_phone: optionalString,
  whatsapp_url: optionalUrl,
  facebook_url: optionalUrl,
  instagram_url: optionalUrl,
  tiktok_url: optionalUrl,
  youtube_url: optionalUrl,
  website_url: optionalUrl,
  og_image_url: optionalUrl,
  og_image_public_id: optionalString,
  og_image_media_id: optionalString,
  status: z.enum(['ACTIVE', 'PAUSED', 'MAINTENANCE']).optional(),
  currency: z.string().trim().max(10).optional().default('XOF'),
  language: z.string().trim().max(10).optional().default('fr'),
  timezone: z.string().trim().max(80).optional().default('Africa/Porto-Novo'),
  primary_color: optionalColor,
  secondary_color: optionalColor,
  accent_color: optionalColor,
  background_color: optionalColor,
  text_color: optionalColor,
  show_banner: z.boolean().optional(),
  show_categories: z.boolean().optional(),
  show_featured_products: z.boolean().optional(),
  show_new_products: z.boolean().optional(),
  show_reviews: z.boolean().optional(),
  show_contact: z.boolean().optional(),
  show_social_links: z.boolean().optional(),
  delivery_enabled: z.boolean().optional(),
  delivery_fee: optionalDecimal,
  free_delivery_threshold: optionalDecimal,
  pickup_enabled: z.boolean().optional(),
  campus_delivery_enabled: z.boolean().optional(),
  local_delivery_enabled: z.boolean().optional(),
  meta_title: optionalString,
  meta_description: optionalString,
  logo_url: optionalUrl,
  banner_url: optionalUrl,
  favicon_url: optionalUrl,
  logo_media_id: optionalString,
  banner_media_id: optionalString,
  favicon_media_id: optionalString,
  allow_guest_checkout: z.boolean().optional(),
  allow_cancellation: z.boolean().optional(),
})

export type ShopSettingsInput = z.infer<typeof shopSettingsSchema>
