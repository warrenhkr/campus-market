import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveShop } from '@/lib/active-shop'
import SellerWithdrawals from '@/components/seller/SellerWithdrawals'

export default async function SellerWithdrawalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { shop } = await getActiveShop(user.id)
  if (!shop) redirect('/become-seller')

  return (
    <div>
      <SellerWithdrawals />
    </div>
  )
}
