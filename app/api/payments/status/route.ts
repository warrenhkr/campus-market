import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 200 })
    }

    const payment = await prisma.payment.findUnique({ where: { transaction_id: String(id) } })

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        status: payment.status,
        order_id: payment.order_id,
        transaction_id: payment.transaction_id,
      },
    }, { status: 200 })
  } catch (err) {
    console.error('Error checking payment status:', err)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 200 })
  }
}
