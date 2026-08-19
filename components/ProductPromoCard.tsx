'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProductPromoCardProps {
  price: number
  originalPrice: number | null
  promoLabel?: string
  promoEndAt?: string
  ctaText?: string
  ctaUrl?: string
  ctaStyle?: 'PRIMARY' | 'SECONDARY'
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

/** Compte à rebours réellement vivant : se met à jour chaque seconde côté
 * client. Un rendu figé calculé une seule fois donnerait l'impression d'une
 * fonctionnalité cassée dès que l'acheteur regarde l'écran plus de 1 seconde. */
function useCountdown(endAt: string | undefined) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!endAt) return
    // Le premier setNow ici synchronise l'horloge cliente avec l'effet (le
    // rendu serveur ne connaît pas "maintenant" côté navigateur) — nécessaire
    // pour éviter un mismatch d'hydratation, seul le setInterval périodique
    // fait ensuite le vrai travail de "synchronisation avec un système externe".
    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endAt])

  if (!endAt || now === null) return null
  const diff = new Date(endAt).getTime() - now
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

export function ProductPromoCard({
  price,
  originalPrice,
  promoLabel,
  promoEndAt,
  ctaText,
  ctaUrl,
  ctaStyle = 'PRIMARY',
}: ProductPromoCardProps) {
  const countdown = useCountdown(promoEndAt)
  const hasSale = originalPrice && originalPrice > price
  const ctaClass = ctaStyle === 'SECONDARY'
    ? 'bg-[var(--surface)] text-foreground border border-border hover:bg-[var(--surface-2)]'
    : 'bg-primary text-primary-foreground hover:bg-primary-hover'

  return (
    <div className="space-y-4 mb-6 rounded-3xl border border-border bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-center gap-3">
        {promoLabel ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {promoLabel}
          </span>
        ) : (
          <span className="rounded-full bg-muted/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Offre produit
          </span>
        )}
        {hasSale && (
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-destructive">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </span>
        )}
      </div>

      {countdown && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Offre limitée — se termine dans</span>
          <div className="flex items-center gap-1.5">
            {countdown.days > 0 && (
              <span className="rounded-lg bg-primary-dim px-2 py-1 text-xs font-bold tabular-nums text-primary">
                {countdown.days}j
              </span>
            )}
            <span className="rounded-lg bg-primary-dim px-2 py-1 text-xs font-bold tabular-nums text-primary">
              {String(countdown.hours).padStart(2, '0')}h
            </span>
            <span className="rounded-lg bg-primary-dim px-2 py-1 text-xs font-bold tabular-nums text-primary">
              {String(countdown.minutes).padStart(2, '0')}m
            </span>
            <span className="rounded-lg bg-primary-dim px-2 py-1 text-xs font-bold tabular-nums text-primary">
              {String(countdown.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-5xl font-extrabold" style={{ color: 'var(--primary)' }}>
            {formatPrice(price)} <span className="text-2xl font-semibold">FCFA</span>
          </p>
          {hasSale && (
            <p className="mt-2 text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice!)} FCFA
            </p>
          )}
        </div>
        {ctaText && ctaUrl && (
          <Link
            href={ctaUrl}
            className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${ctaClass}`}
            target="_blank"
            rel="noreferrer"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )
}
