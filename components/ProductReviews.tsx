'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { StarRating } from '@/components/StarRating'
import { AnimatedSection } from '@/components/AnimatedSection'

interface Review {
  id: string
  rating: number
  comment: string | null
  is_verified_purchase: boolean
  seller_reply: string | null
  seller_reply_at: string | null
  created_at: string
  user: { name: string | null; email: string }
}

interface ProductReviewsProps {
  productId: string
  initialReviews: Review[]
  /** null si non connecté, true/false selon que l'utilisateur a déjà un avis sur ce produit */
  canReview: boolean | null
}

export function ProductReviews({ productId, initialReviews, canReview }: ProductReviewsProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Choisis une note avant d’envoyer ton avis')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, comment: comment.trim() || null }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Impossible d’envoyer ton avis')
        return
      }

      setReviews((prev) => [data.review, ...prev])
      setShowForm(false)
      setRating(0)
      setComment('')
      toast.success('Merci pour ton avis !')
    } catch {
      toast.error('Erreur réseau, réessaie plus tard')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatedSection delay={0.2}>
      <div className="mb-16">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Avis clients ({reviews.length})
            </h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating value={Math.round(averageRating)} readOnly size={14} />
                <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  {averageRating.toFixed(1)} / 5
                </span>
              </div>
            )}
          </div>

          {canReview === true && !showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Laisser un avis
            </button>
          )}
          {canReview === null && (
            <Link
              href="/login"
              className="text-sm font-medium"
              style={{ color: 'var(--primary)' }}
            >
              Connecte-toi pour laisser un avis
            </Link>
          )}
        </div>

        {showForm && (
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Ta note</p>
            <StarRating value={rating} onChange={setRating} size={24} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qu'as-tu pensé de ce produit ? (optionnel)"
              maxLength={1000}
              rows={3}
              className="mt-4 w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {submitting ? 'Envoi...' : 'Envoyer mon avis'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                  >
                    {(review.user.name ?? review.user.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                        {review.user.name ?? review.user.email.split('@')[0]}
                      </p>
                      {review.is_verified_purchase && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                        >
                          <ShieldCheck size={10} /> Achat vérifié
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">
                      <StarRating value={review.rating} readOnly size={10} />
                    </div>
                  </div>
                  <span className="ml-auto text-xs" style={{ color: 'var(--subtle)' }}>
                    {new Date(review.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {review.comment}
                  </p>
                )}
                {review.seller_reply && (
                  <div
                    className="mt-3 rounded-xl p-3"
                    style={{ background: 'var(--surface-2)', borderLeft: '2px solid var(--primary)' }}
                  >
                    <p className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                      <MessageCircle size={12} style={{ color: 'var(--primary)' }} />
                      Réponse du vendeur
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {review.seller_reply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Aucun avis pour l’instant — sois le premier à donner ton avis sur ce produit.
            </p>
          )
        )}
      </div>
    </AnimatedSection>
  )
}
