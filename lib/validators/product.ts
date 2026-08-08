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

export const productBaseSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().nullable().optional(),
  price: z.coerce.number().positive('Prix invalide'),
  stock: z.coerce.number().int().nonnegative('Stock invalide').optional().default(0),
  category_id: categoryIdSchema.optional(),
  image_url: imageUrlSchema.optional(),
  type: productTypeSchema,
})

export const productCreateSchema = productBaseSchema

export const productUpdateSchema = productBaseSchema.extend({
  is_available: z.boolean().optional(),
})

export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
