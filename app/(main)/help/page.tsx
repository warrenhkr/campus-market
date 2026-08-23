import Link from 'next/link'

const faqs = [
  {
    question: 'Puis-je acheter sans validation ?',
    answer: 'Oui. L’acheteur peut utiliser la plateforme sans validation de compte spécifique. Le paiement reste sécurisé et la modération couvre les contenus interdits.',
  },
  {
    question: 'Que se passe-t-il si un produit est signalé ?',
    answer: 'Le signalement est remis à l’équipe admin qui peut retirer le produit, suspendre la boutique ou appliquer d’autres mesures selon les règles.',
  },
  {
    question: 'Quels contenus sont interdits ?',
    answer: 'Produits illégaux, dangereux, obscènes, contrefaits, fraude ou portant atteinte aux droits d’autrui sont interdits.',
  },
  {
    question: 'Le mode live FedaPay est-il activé ?',
    answer: 'Non. Le live reste désactivé tant que la configuration finale de production n’a pas été validée par l’administrateur.',
  },
]

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <div className="mb-8 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Aide & FAQ</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Centre d’aide Campus Market</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Trouve rapidement les réponses sur les achats, les règles de vente, la sécurité et le fonctionnement de la plateforme.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-3xl border border-border bg-[var(--surface-2)] p-5">
            <p className="text-base font-semibold text-foreground">{faq.question}</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-[var(--surface-2)] p-5">
        <p className="text-sm font-semibold text-foreground">Besoin d’aide plus personnalisée ?</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/legal" className="text-sm font-medium text-primary">Lire les politiques</Link>
          <Link href="/legal/vendeur" className="text-sm font-medium text-primary">Règles vendeur</Link>
          <a href="mailto:support@campus-market.com" className="text-sm font-medium text-primary">support@campus-market.com</a>
        </div>
      </div>
    </div>
  )
}
