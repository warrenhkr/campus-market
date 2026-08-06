'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }

  return { success: true }
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email       = formData.get('email') as string
  const password    = formData.get('password') as string
  const name        = formData.get('name') as string
  const phone       = formData.get('phone') as string
  const university  = formData.get('university') as string
  const filiere     = formData.get('filiere') as string
  const account_type = formData.get('account_type') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) return { success: false, error: error.message }

  if (data.user) {
    await prisma.user.upsert({
      where:  { id: data.user.id },
      update: {},
      create: {
        id: data.user.id,
        email,
        name,
        phone,
        university,
        filiere,
        account_type,
        role: 'USER',
      },
    })
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function saveOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Non authentifié.' }

  const university = formData.get('university') as string
  const faculty    = formData.get('faculty') as string
  const filiere    = formData.get('filiere') as string

  if (!university || !filiere) {
    return { success: false, error: 'Tous les champs sont requis.' }
  }

  try {
    // 1. Met à jour la DB via Prisma
    await prisma.user.update({
      where: { id: user.id },
      data: {
        university,
        faculty: faculty || null,
        filiere,
      },
    })

    // 2. Marque onboarding_complete dans les user_metadata Supabase
    //    → lu par proxy.ts sans appel DB (depuis le JWT)
    await supabase.auth.updateUser({
      data: { onboarding_complete: true },
    })

    return { success: true }
  } catch (err) {
    console.error('saveOnboarding error:', err)
    return { success: false, error: 'Erreur lors de la sauvegarde.' }
  }
}