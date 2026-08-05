import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CRON JOB - À appeler quotidiennement
// Exemple configuration Vercel (vercel.json) :
// { "crons": [{ "path": "/api/cron/check-subscriptions", "schedule": "0 0 * * *" }] }
// Requiert l'en-tête : Authorization: Bearer <CRON_SECRET>

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const CRON_SECRET = process.env.CRON_SECRET

  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
  }

  try {
    const today = new Date()
    
    // 1. Rappel à J-3
    const inThreeDaysStart = new Date(today)
    inThreeDaysStart.setDate(today.getDate() + 3)
    inThreeDaysStart.setHours(0, 0, 0, 0)
    
    const inThreeDaysEnd = new Date(inThreeDaysStart)
    inThreeDaysEnd.setHours(23, 59, 59, 999)

    const expiringSoon = await prisma.seller.findMany({
      where: {
        subscription_expires_at: {
          gte: inThreeDaysStart,
          lte: inThreeDaysEnd,
        },
        subscription_plan: { not: 'DECOUVERTE' }
      }
    })

    const reminderPromises = expiringSoon.map(seller => 
      prisma.notification.create({
        data: {
          user_id: seller.user_id,
          type: 'subscription',
          title: 'Abonnement expire bientôt',
          message: 'Votre abonnement expire dans 3 jours. Pensez à le renouveler pour conserver vos avantages.',
        }
      })
    )

    // 2. Traitement des expirés (Date dépassée)
    const expiredSellers = await prisma.seller.findMany({
      where: {
        subscription_expires_at: { lt: today },
        subscription_plan: { not: 'DECOUVERTE' }
      }
    })

    const expiredPromises = expiredSellers.map(seller => 
      prisma.$transaction([
        prisma.seller.update({
          where: { id: seller.id },
          data: {
            subscription_plan: 'DECOUVERTE',
          }
        }),
        prisma.notification.create({
          data: {
            user_id: seller.user_id,
            type: 'subscription',
            title: 'Abonnement expiré',
            message: 'Votre abonnement a expiré. Vous êtes de retour sur le plan Découverte. Veuillez désactiver manuellement les produits en excès pour rester conforme à la limite de 3 produits actifs.',
          }
        }),
        prisma.adminLog.create({
          data: {
            action: 'subscription_expired',
            resource_type: 'seller',
            resource_id: seller.id,
            changes: { from: seller.subscription_plan, to: 'DECOUVERTE' },
          }
        })
      ])
    )

    await Promise.all([...reminderPromises, ...expiredPromises])

    return NextResponse.json({
      success: true,
      remindersSent: expiringSoon.length,
      subscriptionsDowngraded: expiredSellers.length
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
