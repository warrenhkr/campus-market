import { AnimatedSection } from '@/components/AnimatedSection'
import { Card, CardContent } from '@/components/ui/card'
import { Headphones, Mail, MessageCircle } from '@/components/ServerIcons'

const faqs = [
  {
    question: 'Dois-je valider mon compte pour vendre ?',
    answer: 'Non. La vérification est facultative et ne bloque plus la vente. Elle sert d’option de confiance, mais la modération du contenu et les règles de la plateforme restent les garde-fous principaux.',
  },
  {
    question: 'Comment se passe un retrait ?',
    answer: 'Le vendeur peut demander un retrait depuis son espace. La demande est enregistrée et traitée par le staff. Le mode live reste verrouillé tant que la configuration de production n’est pas validée.',
  },
  {
    question: 'Quels produits sont interdits ?',
    answer: 'Tout produit illégal, dangereux, obscène, contrefait, trompeur ou portant atteinte aux droits d’autrui est interdit. Les signalements peuvent entraîner la suppression du produit ou la suspension du compte.',
  },
  {
    question: 'Que faire en cas de signalement ?',
    answer: 'Le signalement est visible côté admin et peut être traité rapidement. Le service peut examiner la boutique, retirer l’annonce ou appliquer une sanction adaptée.',
  },
  {
    question: 'Quels moyens de paiement sont supportés ?',
    answer: 'Le système est configuré autour de FedaPay avec mode sandbox par défaut et garde-fou admin avant activation live. Les méthodes locales peuvent être utilisées selon la configuration finale.',
  },
]

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
                Le plus souvent demandé par les vendeurs et acheteurs sur la plateforme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border border-border">
        <CardContent className="space-y-4 p-5 md:p-6">
          <h2 className="text-xl font-bold text-foreground">FAQ vendeur</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border bg-[var(--surface-2)] p-4">
                <p className="font-semibold text-foreground">{faq.question}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
