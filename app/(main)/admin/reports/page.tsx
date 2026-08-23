import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { ReportModerationBoard } from '@/components/admin/ReportModerationBoard'

async function requireAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'ADMIN') redirect('/seller')
}

export default async function AdminReportsPage() {
  await requireAdminUser()

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">Administration</p>
        <h1 className="text-3xl font-bold">Modération & signalements</h1>
        <p className="text-sm text-muted-foreground">
          Traiter les signalements, vérifier les situations de fraude et appliquer les règles de modération de la marketplace.
        </p>
      </div>

      <ReportModerationBoard />
    </div>
  )
}
