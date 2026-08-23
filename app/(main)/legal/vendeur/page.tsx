const rules = [
  'Les produits interdits comprennent les contenus illégaux, dangereux, obscènes, trompeurs, contrefaits ou portant atteinte aux droits d’autrui.',
  'Le vendeur doit fournir des informations exactes sur le produit, son état, son prix et sa disponibilité.',
  'Les centres de paiement, les retraits et les achats doivent respecter les règles internes de sécurité et de conformité.',
  'La vente de produits sexuels explicites, de substances illégales ou de matériels dangereux est strictement interdite.',
  'Les comptes peuvent être suspendus en cas de signalement sérieux, de fraude, d’usurpation d’identité ou de contenu interdit.',
  'Les produits signalés peuvent être retirés de la marketplace avant tout remboursement ou validation ultérieure.',
]

export default function SellerRulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-8 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Règles vendeur</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Règlement de vente et modération marketplace</h1>
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-[var(--surface-2)] p-6 md:p-8">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Principes de base</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Campus Market autorise la vente de biens et services entre étudiants, sous réserve du respect des lois, de la sécurité des utilisateurs et de la qualité des annonces. L’ouverture d’une boutique et la publication d’un produit ne nécessitent pas de validation manuelle préalable. Les annonces peuvent toutefois être signalées, masquées ou supprimées si elles ne respectent pas ces règles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Contenus interdits</h2>
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {rules.map((rule) => (
              <li key={rule} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">Modération et sanctions</h2>
          <p className="text-sm leading-7 text-muted-foreground">
            En cas d’infraction aux règles, Campus Market peut : supprimer l’annonce, bloquer la vente, suspendre le compte du vendeur, refuser les retraits ou signaler les faits aux autorités compétentes si nécessaire.
          </p>
        </section>
      </div>
    </div>
  )
}
