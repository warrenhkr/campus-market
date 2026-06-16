import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const event = body?.name
    const transaction = body?.data?.object

    if (!transaction) {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 })
    }

    const orderId = transaction.metadata?.order_id
    const transactionId = String(transaction.id)
    const status = transaction.status

    if (!orderId) {
      return NextResponse.json({ error: 'order_id manquant' }, { status: 400 })
    }

    if (event === 'transaction.approved' || status === 'approved') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' },
        }),
        prisma.payment.updateMany({
          where: { transaction_id: transactionId },
          data: { status: 'CAPTURED', paid_at: new Date() },
        }),
      ])
    } else if (event === 'transaction.canceled' || status === 'canceled') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        }),
        prisma.payment.updateMany({
          where: { transaction_id: transactionId },
          data: { status: 'FAILED' },
        }),
      ])
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}