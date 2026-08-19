import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ notifications: [] }, { status: 200 })
  }

  const notifications = await prisma.notification.findMany({
    where: { OR: [{ user_id: user.id }, { user_id: null }] },
    orderBy: { created_at: 'desc' },
    take: 8,
  })

  return NextResponse.json({ notifications })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const body = await req.json()

  if (body.mark_all) {
    await prisma.notification.updateMany({
      where: { OR: [{ user_id: user.id }, { user_id: null }], is_read: false },
      data: { is_read: true },
    })
    return NextResponse.json({ success: true })
  }

  if (!body.id) {
    return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
  }

  await prisma.notification.updateMany({
    where: { id: body.id, OR: [{ user_id: user.id }, { user_id: null }] },
    data: { is_read: true },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const body = await req.json()
  if (!body.id) {
    return NextResponse.json({ error: 'ID requis.' }, { status: 400 })
  }

  await prisma.notification.deleteMany({
    where: { id: body.id, OR: [{ user_id: user.id }, { user_id: null }] },
  })

  return NextResponse.json({ success: true })
}
