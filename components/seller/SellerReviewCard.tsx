'use client'

import { useState } from 'react'
import { Star, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

interface SellerReviewCardProps {
  review: {
    id: string
    rating: number
    comment: string | null
    is_verified_purchase: boolean
    seller_reply: string | null
    created_at: string
    product: { name: string }
    user: { name: string | null; email: string }
  }
}

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} size={14} fill={i < rating ? '#F59E0B' : 'none'} stroke={i < rating ? '#F59E0B' : '#D1D5DB'} />
      ))}
    </div>
  )
}

export function SellerReviewCard({ review }: SellerReviewCardProps) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [savedReply, setSavedReply] = useState(review.seller_reply)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Écris une réponse avant d’envoyer')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_reply: replyText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Impossible d’envoyer la réponse')
        return
      }
      setSavedReply(data.review.seller_reply)
      setReplying(false)
      toast.success('Réponse publiée')
    } catch {
      toast.error('Erreur réseau, réessaie plus tard')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="rounded-3xl border border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {review.user.name ?? review.user.email}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}
              >
                {review.product.name}
              </span>
              {review.is_verified_purchase && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                >
                  Achat vérifié
                </span>
              )}
            </div>
            <StarRow rating={review.rating} />
            {review.comment && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--foreground)' }}>
                &ldquo;{review.comment}&rdquo;
              </p>
            )}

            {savedReply ? (
              <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--surface-2)', borderLeft: '2px solid var(--primary)' }}>
                <p className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                  <MessageCircle size={12} style={{ color: 'var(--primary)' }} />
                  Ta réponse
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{savedReply}</p>
              </div>
            ) : replying ? (
              <div className="mt-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Réponds publiquement à cet avis..."
                  rows={2}
                  maxLength={1000}
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitReply}
                    disabled={submitting}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    {submitting ? 'Envoi...' : 'Publier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplying(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setReplying(true)}
                className="mt-3 text-xs font-semibold"
                style={{ color: 'var(--primary)' }}
              >
                Répondre à cet avis
              </button>
            )}
          </div>
          <time className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>
            {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
        </div>
      </CardContent>
    </Card>
  )
}
