import { z } from 'zod'

const categoryIdSchema = z.preprocess((value) => {
  if (value === '' || value === null) return null
  return typeof value === 'string' ? value : undefined
}, z.string().uuid().nullable())

const imageUrlSchema = z.preprocess((value) => {
  if (value === '' || value === null) return null
  return typeof value === 'string' ? value : undefined
}, z.string().url().nullable())

const productTypeSchema = z.enum(['PHYSICAL', 'DIGITAL']).optional().default('PHYSICAL')

const promoDateSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null
  if (typeof value === 'string' || value instanceof Date) return new Date(value)
  return undefined
}, z.date().nullable().optional())

const ctaStyleSchema = z.enum(['PRIMARY', 'SECONDARY']).optional().default('PRIMARY')

const stockModeSchema = z.enum(['UNLIMITED', 'TRACKED', 'PREORDER', 'OUT_OF_STOCK']).optional().default('TRACKED')

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nom de variante requis'),
  price_delta: z.coerce.number().optional().default(0),
  stock_delta: z.coerce.number().int().optional().default(0),
  sku: z.string().nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

export const productDeliveryZoneSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Nom de zone requis'),
  fee: z.coerce.number().nonnegative().nullable().optional(),
  estimated_min_days: z.coerce.number().int().nonnegative().nullable().optional(),
  estimated_max_days: z.coerce.number().int().nonnegative().nullable().optional(),
  is_active: z.boolean().optional().default(true),
})

const faqLayoutSchema = z.enum(['ACCORDION', 'GRID', 'LIST']).optional().default('ACCORDION')

export const productFaqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1, 'Question requise').max(300, 'Question trop longue'),
  answer: z.string().min(1, 'Réponse requise').max(3000, 'Réponse trop longue'),
  is_published: z.boolean().optional().default(true),
  layout: faqLayoutSchema,
})

export const productPricingTierSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1, 'Nom du tarif requis').max(100, 'Nom trop long'),
  price: z.coerce.number().positive('Prix invalide'),
  is_default: z.boolean().optional().default(false),
})

const slugSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return null
  if (typeof value !== 'string') return undefined
  // slug propre : minuscules, chiffres, tirets uniquement
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}, z.string().min(1).nullable())

const heroSectionSchema = z.object({
  type: z.literal('hero'),
  id: z.string().optional(),
  position: z.coerce.number().int().nonnegative().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  styles: z.record(z.string()).optional().nullable(),
  content: z.object({
    headline: z.string().nullable().optional(),
    subheadline: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    ctaText: z.string().nullable().optional(),
    ctaUrl: z.string().nullable().optional(),
  }),
})

const textSectionSchema = z.object({
  type: z.literal('text'),
  id: z.string().optional(),
  position: z.coerce.number().int().nonnegative().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  styles: z.record(z.string()).optional().nullable(),
  content: z.object({
    title: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
  }),
})

const featureListItemSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

const featureListSectionSchema = z.object({
  type: z.literal('feature_list'),
  id: z.string().optional(),
  position: z.coerce.number().int().nonnegative().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  styles: z.record(z.string()).optional().nullable(),
  content: z.object({
    title: z.string().nullable().optional(),
    items: z.array(featureListItemSchema).optional().default([]),
  }),
})

const faqItemSchema = z.object({
  question: z.string().nullable().optional(),
  answer: z.string().nullable().optional(),
})

const faqSectionSchema = z.object({
  type: z.literal('faq'),
  id: z.string().optional(),
  position: z.coerce.number().int().nonnegative().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  styles: z.record(z.string()).optional().nullable(),
  content: z.object({
    title: z.string().nullable().optional(),
    items: z.array(faqItemSchema).optional().default([]),
  }),
})

const ctaSectionSchema = z.object({
  type: z.literal('cta'),
  id: z.string().optional(),
  position: z.coerce.number().int().nonnegative().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  styles: z.record(z.string()).optional().nullable(),
  content: z.object({
    headline: z.string().nullable().optional(),
    buttonText: z.string().nullable().optional(),
    buttonUrl: z.string().nullable().optional(),
  }),
})

const salesPageSectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  textSectionSchema,
  featureListSectionSchema,
  faqSectionSchema,
  ctaSectionSchema,
])

const availabilityScopeSchema = z.enum(['MON_UNIVERSITE', 'AUTRES_UNIVERSITES', 'HORS_UNIVERSITE', 'PARTOUT'])

const metadataSchema = z.object({
  slug: z.string().nullable().optional(),
  seo: z.object({
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    ogTitle: z.string().nullable().optional(),
    ogDescription: z.string().nullable().optional(),
    ogImage: z.string().nullable().optional(),
  }).optional(),
  visibility: z.object({
    showStock: z.boolean().optional().default(true),
    showRelatedProducts: z.boolean().optional().default(true),
  }).optional(),
  gallery: z.array(z.string().nullable()).optional().nullable(),
  availability: z.object({
    scope: availabilityScopeSchema.optional().default('PARTOUT'),
    note: z.string().nullable().optional(),
  }).optional().nullable(),
  pickup: z.object({
    available: z.boolean().optional().default(false),
    location: z.string().nullable().optional(),
  }).optional().nullable(),
  delivery: z.object({
    enabled: z.boolean().optional().default(false),
    fee: z.coerce.number().nullable().optional(),
    freeThreshold: z.coerce.number().nullable().optional(),
  }).optional().nullable(),
  salesPage: z.object({
    hero: z.object({
      headline: z.string().nullable().optional(),
      subheadline: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      ctaText: z.string().nullable().optional(),
      ctaUrl: z.string().nullable().optional(),
    }).optional().nullable(),
    body: z.string().nullable().optional(),
    sections: z.array(salesPageSectionSchema).optional().nullable(),
  }).optional().nullable(),
}).passthrough().optional().nullable()

const productBaseObject = z.object({
  name: z.string().min(1, 'Nom requis'),
  slug: slugSchema.optional(),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive('Prix invalide'),
  original_price: z.coerce.number().positive('Prix d\'origine invalide').optional().nullable(),
  stock: z.coerce.number().int().nonnegative('Stock invalide').optional().default(0),
  stock_mode: stockModeSchema,
  low_stock_threshold: z.coerce.number().int().nonnegative().nullable().optional(),
  allow_backorder: z.boolean().optional().default(false),
  category_id: categoryIdSchema.optional(),
  image_url: imageUrlSchema.optional(),
  type: productTypeSchema,
  promo_label: z.string().min(1, 'Libellé promotionnel invalide').optional().nullable(),
  promo_start_at: promoDateSchema,
  promo_end_at: promoDateSchema,
  promo_auto_renew: z.boolean().optional().default(false),
  cta_text: z.string().min(1, 'Texte du CTA requis').optional().nullable(),
  cta_url: imageUrlSchema.optional().nullable(),
  cta_style: ctaStyleSchema,
  is_available: z.boolean().optional().default(true),
  // Exclusivité et visibilité
  is_hidden_from_shop: z.boolean().optional().default(false),
  hide_sales_count: z.boolean().optional().default(false),
  sales_limit: z.coerce.number().int().positive('La limite doit être positive').nullable().optional(),
  // Réapprovisionnement automatique
  restock_threshold: z.coerce.number().int().nonnegative().nullable().optional(),
  restock_quantity: z.coerce.number().int().positive('La quantité doit être positive').nullable().optional(),
  // Post-achat et protection (produits numériques principalement)
  post_purchase_instructions: z.string().max(5000, 'Instructions trop longues').nullable().optional(),
  require_shipping_address: z.boolean().optional().default(false),
  file_password: z.string().max(100, 'Mot de passe trop long').nullable().optional(),
  watermark_files: z.boolean().optional().default(false),
  // SEO dédié à la fiche produit
  seo_title: z.string().max(160, 'Titre SEO trop long').nullable().optional(),
  seo_description: z.string().max(320, 'Description SEO trop longue').nullable().optional(),
  seo_thumbnail_url: imageUrlSchema.optional().nullable(),
  seo_keywords: z.string().max(500, 'Liste de mots-clés trop longue').nullable().optional(),
  variants: z.array(productVariantSchema).optional().default([]),
  delivery_zones: z.array(productDeliveryZoneSchema).optional().default([]),
  faqs: z.array(productFaqSchema).optional().default([]),
  pricing_tiers: z.array(productPricingTierSchema).optional().default([]),
  metadata: metadataSchema,
})

/** Raffinements partagés entre création et mise à jour — appliqués après
 * .extend() dans chaque schéma final, donc définis comme fonction plutôt que
 * chaînés directement sur productBaseObject (un ZodObject.refine() renvoie un
 * ZodEffects qui perd la méthode .extend() nécessaire à productUpdateSchema). */
function withProductRefinements<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .refine(
      (data: z.infer<T>) => !data.original_price || data.original_price > data.price,
      { message: 'Le prix d\'origine doit être supérieur au prix actuel.', path: ['original_price'] }
    )
    .refine(
      (data: z.infer<T>) => !data.cta_url || (typeof data.cta_text === 'string' && data.cta_text.trim().length > 0),
      { message: 'Le texte du CTA est requis si une URL est définie.', path: ['cta_text'] }
    )
    .refine(
      (data: z.infer<T>) => !data.restock_quantity || data.restock_threshold != null,
      { message: 'Un seuil de réapprovisionnement est requis si une quantité est définie.', path: ['restock_threshold'] }
    )
    .refine(
      (data: z.infer<T>) => data.pricing_tiers.filter((tier: { is_default?: boolean }) => tier.is_default).length <= 1,
      { message: 'Un seul tarif peut être défini par défaut.', path: ['pricing_tiers'] }
    )
}

export const productCreateSchema = withProductRefinements(productBaseObject)

export const productUpdateSchema = withProductRefinements(
  productBaseObject.extend({ is_available: z.boolean().optional() })
)

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
