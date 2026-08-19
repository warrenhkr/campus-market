import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PaymentModeManager } from '@/components/admin/PaymentModeManager'

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

export default async function AdminPaymentsPage() {
  await requireAdminUser()

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">Administration</p>
        <h1 className="text-3xl font-bold">Paiements & FedaPay</h1>
        <p className="text-sm text-muted-foreground">
          Contrôle du mode sandbox / live, préparation de la mise en production et validation des clés de paiement.
        </p>
      </div>

      <PaymentModeManager />
    </div>
  )
}
