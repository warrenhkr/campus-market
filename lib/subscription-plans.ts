export type SubscriptionPlan = 'DECOUVERTE' | 'STARTER' | 'BUSINESS' | 'PRO'

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan
  label: string
  priceLabel: string
  monthlyPriceFcfa: number | null
  /** Taux de commission prélevé par la plateforme sur chaque vente, en fraction (0.05 = 5%) */
  commissionRate: number
  maxProducts: number | null
  badge: string | null
  features: string[]
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
  DECOUVERTE: {
    id: 'DECOUVERTE',
    label: 'Découverte',
    priceLabel: 'Gratuit',
    monthlyPriceFcfa: 0,
    commissionRate: 0.05,
    maxProducts: 3,
    badge: null,
    features: [
      '3 produits en vente',
      'Commission de 5% par vente',
      'Visibilité standard dans le catalogue',
      'Statistiques basiques',
    ],
  },
  STARTER: {
    id: 'STARTER',
    label: 'Starter',
    priceLabel: '500 FCFA/mois',
    monthlyPriceFcfa: 500,
    commissionRate: 0.02,
    maxProducts: 10,
    badge: 'Vendeur Vérifié',
    features: [
      "Jusqu'à 10 produits en vente",
      'Commission réduite à 2% par vente',
      'Badge "Vendeur Vérifié"',
      'Visibilité améliorée dans les résultats',
      'Statistiques basiques',
    ],
  },
  BUSINESS: {
    id: 'BUSINESS',
    label: 'Business',
    priceLabel: '1000 FCFA/mois',
    monthlyPriceFcfa: 1000,
    commissionRate: 0,
    maxProducts: null,
    badge: 'Vendeur Vérifié',
    features: [
      'Produits en vente illimités',
      'Commission à 0% — tu gardes 100% de tes ventes',
      "Visibilité premium (page d'accueil + recherche prioritaire)",
      'Statistiques avancées',
      'Codes promo et outils marketing',
    ],
  },
  PRO: {
    id: 'PRO',
    label: 'Pro',
    priceLabel: 'Sur-mesure',
    monthlyPriceFcfa: null,
    commissionRate: 0.015,
    maxProducts: null,
    badge: 'Vendeur Vérifié',
    features: [
      'Produits en vente illimités',
      'Commission préférentielle 1 à 2%',
      'Gestionnaire de compte dédié',
      'Accès API pour la gestion des stocks',
      'Rapports détaillés et exportables',
    ],
  },
}

export function getSubscriptionPlanConfig(plan: string | null | undefined): SubscriptionPlanConfig {
  if (plan && plan in SUBSCRIPTION_PLANS) {
    return SUBSCRIPTION_PLANS[plan as SubscriptionPlan]
  }
  return SUBSCRIPTION_PLANS.DECOUVERTE
}

export function getCommissionRate(plan: string | null | undefined): number {
  return getSubscriptionPlanConfig(plan).commissionRate
}
