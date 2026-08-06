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
 */
export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Vérification en DB : l'utilisateur a-t-il déjà renseigné ses infos ?
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

  // Sinon : affiche le formulaire (typiquement les utilisateurs Google)
  return <OnboardingForm />
}
