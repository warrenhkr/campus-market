"use client"

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function formatPlanLabel(plan: string | null | undefined) {
  switch (plan) {
    case 'STARTER':
      return 'Starter'
    case 'BUSINESS':
      return 'Business'
    default:
      return 'Découverte'
  }
}

function formatStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'Approuvé'
    case 'canceled':
      return 'Annulé'
    case 'failed':
      return 'Échoué'
    default:
      return 'En attente'
  }
}

function getHeroCopy(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
      return {
        title: 'Paiement confirmé',
        description: 'Votre abonnement est en cours d’activation. Merci pour votre confiance.',
      }
    case 'canceled':
      return {
        title: 'Paiement annulé',
        description: 'Le paiement n’a pas abouti. Vous pouvez réessayer à tout moment.',
      }
    case 'failed':
      return {
        title: 'Paiement refusé',
        description: 'Le paiement a été refusé par le prestataire. Une nouvelle tentative reste possible.',
      }
    default:
      return {
        title: 'État du paiement',
        description: 'Nous vérifions la dernière mise à jour de votre abonnement.',
      }
  }
}

function PaymentResultContent() {
  const params = useSearchParams()
  const statusParam = params?.get('status') ?? ''
  const id = params?.get('id') ?? ''
  const planParam = params?.get('plan') ?? ''

  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [serverPlan, setServerPlan] = useState<string | null>(planParam || null)
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)

  const hero = useMemo(() => getHeroCopy(statusParam), [statusParam])
  const statusLabel = useMemo(() => formatStatusLabel(statusParam), [statusParam])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedPlan = window.sessionStorage.getItem('pendingSubscriptionPlan')
      if (storedPlan) {
        setPendingPlan(storedPlan)
        setServerPlan(storedPlan)
      }
    }
  }, [])

  useEffect(() => {
    if (!id) return

    let attempts = 0
    let stopped = false

    const poll = async () => {
      if (stopped) return
      attempts += 1
      setChecking(true)

      try {
        const planToUse = planParam || pendingPlan || ''
        const res = await fetch(`/api/seller/subscription/status?id=${encodeURIComponent(id)}${planToUse ? `&plan=${encodeURIComponent(planToUse)}` : ''}`)
        const data = await res.json()
        if (data?.success && data.subscription?.plan) {
          const plan = String(data.subscription.plan)
          setServerPlan(plan)

          if (plan !== 'DECOUVERTE') {
            setMessage(`Votre abonnement ${formatPlanLabel(plan)} est maintenant actif.`)
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem('pendingSubscriptionPlan')
            }
            stopped = true
            setChecking(false)
            return
          }

          if (statusParam.toLowerCase() === 'approved') {
            setMessage('Le paiement est validé. Nous finalisons l’activation de votre abonnement…')
          }
        }
      } catch {
        // ignore
      }

      setChecking(false)
      if (attempts < 6 && !stopped) {
        setTimeout(poll, 2000)
      } else if (!stopped) {
        setMessage('Le paiement a été confirmé. Si votre abonnement n’apparaît pas immédiatement, revenez au tableau de bord dans quelques instants.')
      }
    }

    poll()
    return () => { stopped = true }
  }, [id, pendingPlan, statusParam, planParam])

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{hero.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">{hero.description}</p>
            <p className="mt-2 text-lg font-semibold">Nous finalisons la mise à jour de votre abonnement.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted-foreground">Statut fourni</div>
              <div className="font-semibold">{statusLabel || '—'}</div>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm text-muted-foreground">Transaction</div>
              <div className="font-semibold">{id || '—'}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Abonnement actuel</div>
            <div className="mt-1 flex items-center gap-2 text-xl font-semibold">
              {serverPlan ? formatPlanLabel(serverPlan) : 'Mise à jour en cours…'}
              {checking && <Loader2 size={16} className="animate-spin text-muted-foreground" />}
            </div>
          </div>

          {message && <div className="text-sm text-muted-foreground">{message}</div>}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" onClick={() => (window.location.href = '/')}>Retour à l&apos;accueil</Button>
            <Button onClick={() => (window.location.href = '/seller')}>Ouvrir le tableau de bord</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Chargement du résultat…</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nous préparons la page de confirmation de votre paiement.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  )
}
