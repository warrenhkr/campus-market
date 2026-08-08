import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ profile: null }, { status: 200 })
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      role: true,
      created_at: true,
    },
  })

  return NextResponse.json({ profile })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const body = await req.json()
  const updates: Record<string, unknown> = {}

  if ('name' in body) {
    updates.name = body.name ?? null
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    })
  }

  if ('password' in body && typeof body.password === 'string' && body.password.length >= 6) {
    const { error } = await supabase.auth.updateUser({ password: body.password })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar_url: true,
      role: true,
      created_at: true,
    },
  })

  return NextResponse.json({ profile })
}
