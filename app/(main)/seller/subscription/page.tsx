import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SubscriptionPlansClient } from '@/components/seller/SubscriptionPlansClient'

export const metadata = {
  title: 'Mon abonnement — Campus Market',
}

export default async function SellerSubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const seller = await prisma.seller.findUnique({
    where: { user_id: user.id },
    select: {
      id: true,
      subscription_plan: true,
      subscription_expires_at: true,
    }
  })

  if (!seller) redirect('/become-seller')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
          Abonnement Vendeur
        </h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Gérez votre plan et débloquez plus de fonctionnalités pour votre boutique.
        </p>
      </div>
      
      <SubscriptionPlansClient 
        currentPlan={seller.subscription_plan} 
        expiresAt={seller.subscription_expires_at ? seller.subscription_expires_at.toISOString() : null} 
      />
    </div>
  )
}
