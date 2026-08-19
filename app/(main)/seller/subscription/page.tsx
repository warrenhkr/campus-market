import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { AnimatedSection } from '@/components/AnimatedSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <AnimatedSection delay={0}>
        <Card className="rounded-3xl border border-border">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
              Abonnement Vendeur
            </CardTitle>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Gérez votre plan et débloquez plus de fonctionnalités pour votre boutique.
            </p>
          </CardHeader>
        </Card>
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <Card className="rounded-3xl border border-border">
          <CardContent>
            <SubscriptionPlansClient 
              currentPlan={seller.subscription_plan} 
              expiresAt={seller.subscription_expires_at ? seller.subscription_expires_at.toISOString() : null} 
            />
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}
