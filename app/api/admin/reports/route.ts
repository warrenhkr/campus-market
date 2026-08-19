import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  const reports = await prisma.report.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, shop_name: true } },
      product: { select: { id: true, name: true } },
      admin: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ success: true, reports })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 })
  }

  const body = await req.json()
  const reportId = typeof body?.reportId === 'string' ? body.reportId : ''
  const status = typeof body?.status === 'string' ? body.status : null
  const resolution = typeof body?.resolution === 'string' ? body.resolution : null

  if (!reportId) {
    return NextResponse.json({ error: 'reportId requis.' }, { status: 400 })
  }

  const report = await prisma.report.update({
    where: { id: reportId },
    data: {
      status: status ?? 'PENDING',
      resolution: resolution ?? null,
      resolved_by: user.id,
      resolved_at: new Date(),
    },
  })

  return NextResponse.json({ success: true, report })
}
