import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Non authentifié.' }, { status: 401 })
    }

    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) {
      return NextResponse.json({ success: false, error: 'Vendeur introuvable.' }, { status: 404 })
    }

    if (seller.subscription_plan === 'DECOUVERTE') {
      return NextResponse.json({ success: true, message: 'Aucun abonnement actif à résilier.' }, { status: 200 })
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        subscription_plan: 'DECOUVERTE',
        subscription_expires_at: null,
      },
    })

    await prisma.notification.create({
      data: {
        user_id: seller.user_id,
        type: 'subscription',
        title: 'Abonnement résilié',
        message: 'Votre abonnement a été résilié. Vous êtes repassé sur le plan Découverte.',
      },
    })

    await prisma.adminLog.create({
      data: {
        action: 'subscription_cancelled',
        resource_type: 'seller',
        resource_id: seller.id,
        changes: { from: seller.subscription_plan, to: 'DECOUVERTE' },
      },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        plan: updatedSeller.subscription_plan,
        expiresAt: updatedSeller.subscription_expires_at,
      },
    }, { status: 200 })
  } catch (err) {
    console.error('Subscription cancellation error:', err)
    return NextResponse.json({ success: false, error: 'Erreur serveur.' }, { status: 500 })
  }
}
