import { AnimatedSection } from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Headphones, Mail, MessageCircle } from '@/components/ServerIcons'

export default function SellerHelpCenterPage() {
  return (
    <div className="space-y-6">
      <AnimatedSection>
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--primary-dim)' }}>
            <Headphones size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Centre d’aide</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Une question sur ta boutique, une commande ou un paiement ?
            </p>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl border border-border">
          <CardContent className="flex items-start gap-3 p-5">
            <Mail size={18} style={{ color: 'var(--primary)' }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Par email</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Écris-nous et on te répond sous 24 à 48h.
              </p>
              <a
                href="mailto:support@campus-market.com"
                className="mt-2 inline-block text-sm font-medium"
                style={{ color: 'var(--primary)' }}
              >
                support@campus-market.com
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border">
          <CardContent className="flex items-start gap-3 p-5">
            <MessageCircle size={18} style={{ color: 'var(--primary)' }} className="mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Questions fréquentes</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Commissions, paiements, expédition — les réponses aux questions les plus posées arrivent bientôt ici.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
