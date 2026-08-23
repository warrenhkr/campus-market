import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { SellerNav } from '@/components/seller/SellerNav'
import { getActiveShop } from '@/lib/active-shop'

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'SELLER') {
    const seller = await prisma.seller.findUnique({ where: { user_id: user.id } })
    if (!seller) redirect('/become-seller')
  }

  const { shop, shops } = await getActiveShop(user.id)

  return (
    <>
      <div className="flex w-full flex-col gap-4 px-3 pt-4 sm:px-5 md:flex-row md:items-start md:gap-6 md:px-6 lg:gap-8 lg:px-10">
        <div className="w-full md:sticky md:top-0 md:block md:h-screen md:w-56 md:shrink-0 md:overflow-y-auto">
          <div className="pt-1 md:pt-2">
            <SellerNav
              shops={shops.map((s) => ({ id: s.id, name: s.name, slug: s.slug, logo_url: s.logo_url }))}
              activeShopId={shop?.id ?? ''}
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 pb-6 md:pb-0">
          <div className="mt-0 md:mt-0">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}