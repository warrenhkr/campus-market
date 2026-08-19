import { z } from 'zod'

export const reviewCreateSchema = z.object({
  product_id: z.string().uuid('Produit invalide'),
  rating: z.coerce.number().int().min(1, 'Note minimale : 1 étoile').max(5, 'Note maximale : 5 étoiles'),
  comment: z.string().trim().max(1000, 'Commentaire trop long (1000 caractères max)').optional().nullable(),
})

export const reviewReplySchema = z.object({
  seller_reply: z.string().trim().min(1, 'Réponse vide').max(1000, 'Réponse trop longue (1000 caractères max)'),
})

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>
