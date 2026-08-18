import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

const VALID_SUBSCRIPTION_PLANS = ['STARTER', 'BUSINESS', 'PRO'] as const
type SubscriptionPlan = (typeof VALID_SUBSCRIPTION_PLANS)[number]
const isValidSubscriptionPlan = (value: string | null): value is SubscriptionPlan =>
  !!value && (VALID_SUBSCRIPTION_PLANS as readonly string[]).includes(value)

interface FedapayTransactionPayload {
  data?: { transaction?: unknown; [key: string]: unknown }
  transaction?: unknown
  'v1/transaction'?: unknown
  v1?: { transaction?: unknown }
}

function extractTransaction(payload: FedapayTransactionPayload): {
  status?: string
  custom_metadata?: Record<string, unknown>
  metadata?: Record<string, unknown>
} | null {
  return (payload?.data?.transaction ?? payload?.transaction ?? payload?.data ?? payload?.v1?.transaction ?? payload?.['v1/transaction'] ?? null) as ReturnType<typeof extractTransaction>
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié.' }, { status: 200 })
    }

    const url = new URL(req.url)
    const transactionId = url.searchParams.get('transaction_id') || url.searchParams.get('id')
    const planFromQuery = url.searchParams.get('plan')
    const selectedPlan = isValidSubscriptionPlan(planFromQuery) ? planFromQuery : null

    let seller = await prisma.seller.findUnique({ where: { user_id: user.id } })

    if (!seller) {
      return NextResponse.json({ success: false, error: 'Vendeur introuvable.' }, { status: 200 })
    }

    if (transactionId) {
      try {
        const fedapayRes = await fetch(`https://sandbox-api.fedapay.com/v1/transactions/${encodeURIComponent(transactionId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
          },
        })

        const fedapayData = await fedapayRes.json()
        const transaction = extractTransaction(fedapayData)
        const metadata = transaction?.custom_metadata || transaction?.metadata || {}
        const transactionStatus = String(transaction?.status ?? '').toLowerCase()
        const planFromMetadata = metadata?.plan ? String(metadata.plan) : null
        const planToActivate = selectedPlan || (isValidSubscriptionPlan(planFromMetadata) ? planFromMetadata : null)

        if (planToActivate && ['approved', 'succeeded', 'success', 'complete', 'completed'].includes(transactionStatus)) {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          seller = await prisma.seller.update({
            where: { id: seller.id },
            data: {
              subscription_plan: planToActivate,
              subscription_expires_at: expiresAt,
            },
          })
        }
      } catch (err) {
        console.error('Unable to sync subscription from FedaPay transaction:', err)
      }
    }

    return NextResponse.json({
      success: true,
      subscription: {
        plan: seller.subscription_plan,
        expiresAt: seller.subscription_expires_at,
      },
    }, { status: 200 })
  } catch (err) {
    console.error('Error fetching subscription status:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 200 })
  }
}
