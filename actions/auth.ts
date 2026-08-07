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
    options: { data: { name, onboarding_complete: true } },
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
    // Utilise upsert : les utilisateurs Google n'ont pas de ligne dans
    // public.users (seul register() en crée une), donc update planterait
    // avec "Record to update not found".
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        university,
        faculty: faculty || '',
        filiere,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        university,
        faculty: faculty || '',
        filiere,
      },
    })

    // Marque onboarding_complete dans les user_metadata Supabase
    // → lu par proxy.ts sans appel DB (depuis le JWT)
    await supabase.auth.updateUser({
      data: { onboarding_complete: true },
    })

    return { success: true }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err
    }
    // Logs détaillés pour Vercel/console
    console.error('[saveOnboarding] Prisma/Supabase error exact:', err instanceof Error ? err.stack : err)
    console.error('[saveOnboarding] Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2))
    return { success: false, error: 'Erreur lors de la sauvegarde. Veuillez réessayer.' }
  }
}