import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getFedaPayLiveMissingConfiguration } from '@/lib/fedapay'

async function getCurrentPaymentMode() {
  const envMode = (process.env.FEDAPAY_ENV || 'sandbox').toLowerCase()
  const fallback = envMode === 'production' || envMode === 'live' ? 'live' : 'sandbox'
  const setting = await prisma.setting.findUnique({ where: { key: 'fedapay_mode' } })
  return setting?.value === 'live' || setting?.value === 'sandbox' ? setting.value : fallback
}

async function requireAdminSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('UNAUTHENTICATED')
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }

  return user
}

export async function GET() {
  try {
    await requireAdminSession()

    const mode = await getCurrentPaymentMode()
    const missingConfiguration = getFedaPayLiveMissingConfiguration()

    return NextResponse.json({
      success: true,
      provider: 'FedaPay',
      mode,
      liveEnabled: mode === 'live' && missingConfiguration.length === 0,
      liveConfigurationReady: missingConfiguration.length === 0,
      missingConfiguration,
      note: 'Le mode live reste désactivé tant que la validation admin de production n’a pas été faite.',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
    }

    console.error('admin/payment-config GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminSession()

    const body = await req.json()
    const rawMode = typeof body?.mode === 'string' ? body.mode.toLowerCase() : 'sandbox'
    const requestedMode = rawMode === 'live' ? 'live' : 'sandbox'

    const missingConfiguration = getFedaPayLiveMissingConfiguration()
    const canEnableLive = requestedMode === 'sandbox' || missingConfiguration.length === 0

    if (canEnableLive) {
      await prisma.setting.upsert({
        where: { key: 'fedapay_mode' },
        update: { value: requestedMode, description: 'Mode FedaPay actif', category: 'payments' },
        create: { key: 'fedapay_mode', value: requestedMode, description: 'Mode FedaPay actif', category: 'payments' },
      })
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      requestedMode,
      liveEnabled: canEnableLive && requestedMode === 'live',
      liveConfigurationReady: missingConfiguration.length === 0,
      missingConfiguration,
      message: canEnableLive
        ? 'Configuration validée pour la bascule live. La mise en production doit toujours être vérifiée avant activation complète.'
        : 'La configuration live est incomplète. Le paiement reste en mode sandbox pour sécuriser la plateforme.',
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHENTICATED') {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
    }

    console.error('admin/payment-config PATCH error:', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
