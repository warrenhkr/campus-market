import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Star } from 'lucide-react'

async function getReviewsData(userId: string) {
  const seller = await prisma.seller.findUnique({
    where: { user_id: userId },
    select: { id: true, shops: { select: { id: true } } },
  })
  if (!seller) return null

  const shopIds = seller.shops.map(s => s.id)

  const reviews = await prisma.review.findMany({
    where: {
      product: { shop_id: { in: shopIds } }
    },
    include: {
      product: { select: { id: true, name: true, image_url: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { created_at: 'desc' },
  })

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  return { reviews, avgRating, ratingCounts }
}

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? '#F59E0B' : 'none'}
          stroke={i < rating ? '#F59E0B' : '#D1D5DB'}
        />
      ))}
    </div>
  )
}

export const metadata = { title: 'Avis reçus — Campus Market' }

export default async function SellerReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const data = await getReviewsData(user.id)
  if (!data) redirect('/become-seller')

  const { reviews, avgRating, ratingCounts } = data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
          Avis reçus ⭐
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Les avis de vos acheteurs sur tous vos produits.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl px-6 py-16 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-3xl mb-3">💬</p>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Aucun avis pour l&apos;instant
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Les avis apparaîtront ici dès que vos acheteurs en laisseront.
          </p>
        </div>
      ) : (
        <>
          {/* Résumé */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Note globale */}
            <div className="rounded-2xl p-6 flex items-center gap-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-center">
                <p className="text-5xl font-extrabold" style={{ color: '#F59E0B' }}>
                  {avgRating.toFixed(1)}
                </p>
                <StarRow rating={Math.round(avgRating)} />
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {reviews.length} avis
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-3 text-right" style={{ color: 'var(--muted-foreground)' }}>
                      {star}
                    </span>
                    <Star size={11} fill="#F59E0B" stroke="#F59E0B" />
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs w-4" style={{ color: 'var(--muted-foreground)' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat rapide */}
            <div className="rounded-2xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-4"
                style={{ color: 'var(--muted-foreground)' }}>
                Répartition
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Positifs (4-5 ★)', count: reviews.filter(r => r.rating >= 4).length, color: '#10B981' },
                  { label: 'Neutres (3 ★)',    count: reviews.filter(r => r.rating === 3).length, color: '#F59E0B' },
                  { label: 'Négatifs (1-2 ★)', count: reviews.filter(r => r.rating <= 2).length, color: '#EF4444' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                    <span className="font-bold" style={{ color }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Liste des avis */}
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="rounded-2xl p-5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {review.user.name ?? review.user.email}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}>
                        {review.product.name}
                      </span>
                    </div>
                    <StarRow rating={review.rating} />
                    {review.comment && (
                      <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--foreground)' }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                  </div>
                  <time className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(review.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
