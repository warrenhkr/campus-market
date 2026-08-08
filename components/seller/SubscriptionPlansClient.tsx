'use client'

import { useEffect, useState } from 'react'
import { Check, Star, Zap, Crown, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PlanConfig = {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  icon: React.ElementType
}

function getPlanCapabilities(planId: string) {
  switch (planId) {
    case 'STARTER':
      return { limitLabel: '10 produits actifs max', isUnlimited: false }
    case 'BUSINESS':
    case 'PRO':
      return { limitLabel: 'Produits illimités', isUnlimited: true }
    case 'DECOUVERTE':
    default:
      return { limitLabel: '3 produits actifs max', isUnlimited: false }
  }
}

const PLANS: PlanConfig[] = [
  {
    id: 'DECOUVERTE',
    name: 'Découverte',
    price: 'Gratuit',
    description: 'Idéal pour tester la plateforme',
    features: ['3 produits actifs max', 'Visibilité standard', 'Support par email'],
    icon: Star,
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: '500 FCFA / mois',
    description: 'Pour les vendeurs réguliers',
    features: ['10 produits actifs', 'Visibilité prioritaire', 'Statistiques de base', 'Support prioritaire'],
    icon: Zap,
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    price: '1000 FCFA / mois',
    description: 'Pour développer vos ventes',
    features: ['Produits illimités', 'Visibilité maximale', 'Outils promotionnels', 'Statistiques avancées', 'Support WhatsApp'],
    icon: Crown,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 'Sur mesure',
    description: 'Pour les très grandes boutiques',
    features: ['Tout en illimité', 'Accompagnement dédié', 'Mise en avant sur l\'accueil', 'API d\'intégration'],
    icon: Crown,
  },
]

export function SubscriptionPlansClient({ 
  currentPlan, 
  expiresAt 
}: { 
  currentPlan: string; 
  expiresAt: string | null 
}) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [planState, setPlanState] = useState<{ plan: string; expiresAt: string | null }>({ plan: currentPlan, expiresAt })

  const handleSubscribe = async (planId: string) => {
    if (planId === 'DECOUVERTE') return
    if (planId === 'PRO') {
      // Redirection ou action pour contacter le support
      window.location.href = '/support?subject=Demande%20Plan%20Pro'
      return
    }

    setLoadingPlan(planId)
    setError('')
    try {
      const res = await fetch('/api/seller/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      console.debug('Subscription init response', res.status, data)

      // Some responses include payment_url at the top level or nested under various keys (v1.transaction, data, etc.)
      const paymentUrl = data.payment_url ?? data?.v1?.transaction?.payment_url ?? data?.['v1/transaction']?.payment_url ?? data?.data?.payment_url

      // Redirect if we have any payment URL
      if (paymentUrl) {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('pendingSubscriptionPlan', planId)
        }
        window.location.href = paymentUrl
        return
      }

      // Otherwise show a friendly error to the user
      setError(data.error || 'Transaction échouée. Veuillez réessayer.')
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleCancel = async () => {
    if (planState.plan === 'DECOUVERTE') return
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    setShowCancelModal(false)
    setLoadingPlan('CANCEL')
    setError('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/seller/subscription/cancel', { method: 'POST' })
      const data = await res.json()
      if (data?.success) {
        setPlanState({ plan: 'DECOUVERTE', expiresAt: null })
        setSuccessMessage('Votre abonnement a bien été résilié.')
      } else {
        setError(data.error || 'Impossible de résilier votre abonnement.')
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  useEffect(() => {
    let mounted = true
    const refresh = async () => {
      try {
        const res = await fetch('/api/seller/subscription/status')
        const data = await res.json()
        if (mounted && data?.success && data.subscription) {
          setPlanState({ plan: data.subscription.plan ?? currentPlan, expiresAt: data.subscription.expiresAt ?? expiresAt })
        }
      } catch (e) {
        // ignore
      }
    }
    refresh()
    return () => { mounted = false }
  }, [currentPlan, expiresAt])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-border rounded-xl p-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Abonnements</h1>
          <p className="text-sm text-muted-foreground">Choisissez le plan adapté à votre boutique. Vous pouvez changer à tout moment.</p>
        </div>

        <div className="mt-2 md:mt-0">
          <Card className="inline-flex items-center gap-4 px-4 py-3 border-primary/20 shadow-sm">
            <div>
              <div className="text-xs text-muted-foreground">Votre plan actuel</div>
              <div className="font-semibold text-foreground">{planState.plan || currentPlan}</div>
              <div className="text-xs text-muted-foreground">
                {getPlanCapabilities(planState.plan || currentPlan).limitLabel}
              </div>
              {planState.expiresAt ? (
                <div className="text-xs text-muted-foreground">Expire le {new Date(planState.expiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              ) : (
                <div className="text-xs text-muted-foreground">Plan gratuit</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="text-sm text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="text-sm text-primary">{successMessage}</div>
          </CardContent>
        </Card>
      )}

      {planState.plan !== 'DECOUVERTE' && (
        <div className="flex justify-end">
          <Button variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={handleCancel} disabled={loadingPlan === 'CANCEL'}>
            {loadingPlan === 'CANCEL' ? 'Résiliation...' : 'Résilier mon abonnement'}
          </Button>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <Card className="w-full max-w-md border-destructive/30 shadow-2xl">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle>Résilier votre abonnement ?</CardTitle>
              </div>
              <CardDescription>
                Cette action vous replacera sur le plan Découverte et supprimera l’accès aux avantages de votre abonnement actuel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Confirmez si vous souhaitez poursuivre la résiliation.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                  Annuler
                </Button>
                <Button variant="destructive" onClick={confirmCancel}>
                  Confirmer la résiliation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = planState.plan === plan.id
          const Icon = plan.icon

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative overflow-hidden border transition-all motion-safe:transform-gpu hover:scale-[1.01] hover:shadow-lg',
                isCurrent ? 'border-primary shadow-md ring-1 ring-primary/30' : 'border-border hover:border-primary/40'
              )}
            >
                {isCurrent && (
                <div className="absolute top-3 right-3">
                  <span
                    className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-md shadow-md ring-1 ring-primary/20"
                    aria-label="Plan actif"
                  >
                    Actif
                  </span>
                </div>
              )}

              <CardHeader className="gap-4 pb-3">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', isCurrent ? 'bg-primary/10' : 'bg-muted/10')}>
                  <Icon className={cn('w-6 h-6', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-foreground">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-0 pb-4">
                <div>
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground">
                  {getPlanCapabilities(plan.id).limitLabel}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-5 h-5 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

                <CardFooter className="pt-4">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || loadingPlan === plan.id || plan.id === 'DECOUVERTE'}
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  aria-pressed={isCurrent}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirection...
                    </>
                  ) : isCurrent ? (
                    'Plan actuel'
                  ) : plan.id === 'PRO' ? (
                    'Nous contacter'
                  ) : plan.id === 'DECOUVERTE' ? (
                    'Inclus par défaut'
                  ) : (
                    'Choisir ce plan'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
