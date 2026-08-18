import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveShop } from '@/lib/active-shop'
import SellerKycForm from '@/components/seller/SellerKycForm'

export default async function SellerKycPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { shop } = await getActiveShop(user.id)
  if (!shop) redirect('/become-seller')

  return (
    <div>
      <SellerKycForm />
    </div>
  )
}
