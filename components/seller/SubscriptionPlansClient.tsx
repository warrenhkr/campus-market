'use client'

import { useState } from 'react'
import { Check, Star, Zap, Crown } from 'lucide-react'

type PlanConfig = {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  icon: React.ElementType
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
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setError(data.error || 'Erreur lors de l\'initialisation du paiement.')
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
        <h2 className="text-emerald-800 font-semibold mb-2">Votre plan actuel : {currentPlan}</h2>
        {expiresAt ? (
          <p className="text-emerald-600 text-sm">
            Expire le {new Date(expiresAt).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}.
          </p>
        ) : (
          <p className="text-emerald-600 text-sm">Plan gratuit à vie.</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          const Icon = plan.icon

          return (
            <div 
              key={plan.id}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                isCurrent ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'border-gray-200 hover:border-gray-300'
              } bg-white`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Actif
                  </span>
                </div>
              )}
              
              <div className="mb-5">
                <Icon className={`w-8 h-8 mb-4 ${isCurrent ? 'text-emerald-500' : 'text-gray-400'}`} />
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
              </div>

              <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <Check className="w-5 h-5 text-emerald-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent || loadingPlan === plan.id || plan.id === 'DECOUVERTE'}
                className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
                  isCurrent 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.id === 'PRO'
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingPlan === plan.id 
                  ? 'Redirection...' 
                  : isCurrent 
                    ? 'Plan actuel' 
                    : plan.id === 'PRO' 
                      ? 'Nous contacter' 
                      : plan.id === 'DECOUVERTE'
                        ? 'Inclus par défaut'
                        : 'Choisir ce plan'
                }
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
