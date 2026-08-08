import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShopSettingsForm } from '@/components/seller/ShopSettingsForm'

async function getSellerShop(userId: string) {
  const seller = await prisma.seller.findUnique({
    where: { user_id: userId },
    include: {
      shops: true,
    },
  })

  return seller?.shops[0] ?? null
}

export default async function SellerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const shop = await getSellerShop(user.id)
  if (!shop) redirect('/become-seller')

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
            <Settings2 size={14} />
            Paramètres de boutique
          </p>
          <h1 className="text-2xl font-bold text-foreground">Gérez votre boutique universitaire</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personnalisez les informations, l’apparence, la livraison, les réseaux sociaux et le SEO.
          </p>
        </div>

        <Button asChild variant="outline" className="gap-2">
          <Link href="/seller/shop">
            <ArrowLeft size={16} />
            Retour à la boutique
          </Link>
        </Button>
      </div>

      <Card className="rounded-3xl border border-border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Configuration complète</CardTitle>
        </CardHeader>
        <CardContent>
          <ShopSettingsForm
            shop={{
              id: shop.id,
              name: shop.name,
              slug: shop.slug,
              description: shop.description,
              email: shop.email,
              phone: shop.phone,
              image_url: shop.image_url,
              logo_url: shop.logo_url,
              banner_url: shop.banner_url,
              favicon_url: shop.favicon_url,
              contact_name: shop.contact_name,
              contact_phone: shop.contact_phone,
              whatsapp_url: shop.whatsapp_url,
              facebook_url: shop.facebook_url,
              instagram_url: shop.instagram_url,
              website_url: shop.website_url,
              tiktok_url: shop.tiktok_url,
              youtube_url: shop.youtube_url,
              og_image_url: shop.og_image_url,
              og_image_public_id: shop.og_image_public_id,
              currency: shop.currency,
              language: shop.language,
              timezone: shop.timezone,
              status: shop.status,
              primary_color: shop.primary_color,
              secondary_color: shop.secondary_color,
              accent_color: shop.accent_color,
              background_color: shop.background_color,
              text_color: shop.text_color,
              show_banner: shop.show_banner,
              show_categories: shop.show_categories,
              show_featured_products: shop.show_featured_products,
              show_new_products: shop.show_new_products,
              show_reviews: shop.show_reviews,
              show_contact: shop.show_contact,
              show_social_links: shop.show_social_links,
              delivery_enabled: shop.delivery_enabled,
              delivery_fee: shop.delivery_fee ? Number(shop.delivery_fee) : null,
              free_delivery_threshold: shop.free_delivery_threshold ? Number(shop.free_delivery_threshold) : null,
              pickup_enabled: shop.pickup_enabled,
              campus_delivery_enabled: shop.campus_delivery_enabled,
              local_delivery_enabled: shop.local_delivery_enabled,
              allow_guest_checkout: shop.allow_guest_checkout,
              allow_cancellation: shop.allow_cancellation,
              meta_title: shop.meta_title,
              meta_description: shop.meta_description,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
