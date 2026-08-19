import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

function getCurrentPaymentMode() {
  const envMode = (process.env.FEDAPAY_ENV || 'sandbox').toLowerCase()
  if (envMode === 'production' || envMode === 'live') return 'live'
  return 'sandbox'
}

function getLiveKeyStatus() {
  const requiredKeys = [
    'FEDAPAY_LIVE_PUBLIC_KEY',
    'FEDAPAY_LIVE_SECRET_KEY',
    'FEDAPAY_LIVE_WEBHOOK_SECRET',
  ] as const

  const missing = requiredKeys.filter((key) => !process.env[key])

  return {
    configured: missing.length === 0,
    missing,
  }
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

    const mode = getCurrentPaymentMode()
    const liveKeys = getLiveKeyStatus()

    return NextResponse.json({
      success: true,
      provider: 'FedaPay',
      mode,
      liveEnabled: mode === 'live' || process.env.FEDAPAY_LIVE_ENABLED === 'true',
      liveKeysConfigured: liveKeys.configured,
      missingKeys: liveKeys.missing,
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

    const liveKeys = getLiveKeyStatus()
    const canEnableLive = requestedMode === 'sandbox' || liveKeys.configured

    return NextResponse.json({
      success: true,
      dryRun: true,
      requestedMode,
      liveEnabled: canEnableLive && requestedMode === 'live',
      liveKeysConfigured: liveKeys.configured,
      missingKeys: liveKeys.missing,
      message: canEnableLive
        ? 'Configuration validée pour la bascule live. La mise en production doit toujours être vérifiée avant activation complète.'
        : 'Les clés live sont manquantes. Le paiement reste en mode sandbox pour sécuriser la plateforme.',
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
