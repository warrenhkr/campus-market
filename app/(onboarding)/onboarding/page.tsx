import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { OnboardingForm } from '@/components/OnboardingForm'

/**
 * Page d'onboarding — Server Component.
 *
 * Logique :
 * 1. Utilisateur non connecté → /login
 * 2. Utilisateur avec university ET filiere déjà en DB (ancien register)
 *    → marque onboarding_complete dans Supabase metadata + redirect /
 * 3. Sinon → affiche le formulaire OnboardingForm (client component)
 * 4. Si la requête Prisma échoue → affiche le formulaire quand même (fallback sûr)
 */
export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Vérifie si l'utilisateur a déjà renseigné ses infos via l'ancien register.
  // En cas d'erreur Prisma (connexion, client pas généré, etc.), on affiche
  // le formulaire plutôt que de crasher avec un 500.
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { university: true, filiere: true },
    })

    const alreadyFilled =
      dbUser?.university && dbUser.university.trim() !== '' &&
      dbUser?.filiere   && dbUser.filiere.trim()   !== ''

    if (alreadyFilled) {
      // Marque silencieusement onboarding_complete → proxy ne le redirigera plus
      await supabase.auth.updateUser({
        data: { onboarding_complete: true },
      })
      redirect('/')
    }
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.message === 'NEXT_REDIRECT') {
      throw err
    }
    console.error('[onboarding] Prisma query failed, showing form as fallback:', err)
    // On continue vers le formulaire ci-dessous
  }

  // Affiche le formulaire (utilisateurs Google ou fallback si erreur Prisma)
  return <OnboardingForm />
}
