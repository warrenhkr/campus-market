import Link from 'next/link'

const items = [
  {
    title: 'Politique de confidentialité',
    href: '/legal/confidentialite',
    summary: 'Données collectées, usage, conservation, cookies et droits des utilisateurs.',
  },
  {
    title: 'Conditions générales d’utilisation',
    href: '/legal/conditions',
    summary: 'Règles de navigation, achats, comptes, responsabilités et recours.',
  },
  {
    title: 'Règles vendeur',
    href: '/legal/vendeur',
    summary: 'Produits interdits, sécurité, gestion des paiements et modération.',
  },
]

export default function LegalHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="mb-10 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Informations légales</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Politiques, conditions et règles de la plateforme</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Campus Market met en place des règles claires pour protéger les acheteurs, les vendeurs et la communauté étudiante.
          Ces documents doivent être consultés avant un achat, une vente ou une création de boutique.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-border bg-[var(--surface-2)] p-6 transition hover:-translate-y-1 hover:border-[var(--primary)]"
          >
            <div className="mb-4 inline-flex rounded-full bg-[var(--primary-dim)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              Document
            </div>
            <h2 className="mb-3 text-xl font-bold text-foreground">{item.title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{item.summary}</p>
            <span className="mt-5 inline-flex text-sm font-semibold text-primary">Consulter →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
