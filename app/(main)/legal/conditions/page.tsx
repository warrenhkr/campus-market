const sections = [
  {
    title: '1. Objet',
    text:
      'Les présentes conditions générales d’utilisation régissent l’accès et l’utilisation de Campus Market, plateforme de vente et d’achat entre étudiants. L’utilisation du site implique l’acceptation sans réserve de ces règles.',
  },
  {
    title: '2. Comptes et sécurité',
    text:
      'Chaque utilisateur doit fournir des informations exactes lors de son inscription. Il est responsable de la confidentialité de son compte et de toute activité réalisée depuis celui-ci. En cas de suspicion d’usage frauduleux, Campus Market peut suspendre temporairement l’accès.',
  },
  {
    title: '3. Achats et paiements',
    text:
      'Les commandes sont soumises aux règles de paiement, de confirmation et de livraison. Campus Market peut mettre en place des contrôles de sécurité ou des modes de paiement sandbox/live selon les validations administratives applicables.',
  },
  {
    title: '4. Produits et ventes',
    text:
      'Les vendeurs doivent proposer des produits conformes aux règles de la plateforme, sans contenu illégal, dangereux, obscène, trompeur ou portant atteinte aux droits d’autrui. Les publications interdites peuvent être supprimées et peuvent entraîner une suspension du compte.',
  },
  {
    title: '5. Modération et signalements',
    text:
      'Les utilisateurs peuvent signaler les produits, boutiques ou contenus frauduleux ou interdits. Campus Market peut examiner, modifier, suspendre ou supprimer un contenu conforme à ses règles de modération.',
  },
  {
    title: '6. Responsabilité',
    text:
      'Campus Market agit comme plateforme de mise en relation et de traitement des paiements. La plateforme n’assume pas la responsabilité directe des échanges entre particuliers ou vendeurs, sauf en cas de faute lourde ou de manquement avéré à ses obligations de modération et de sécurité.',
  },
  {
    title: '7. Protection des données',
    text:
      'Campus Market collecte des informations nécessaires au fonctionnement du service, à la sécurité et au traitement des commandes. Ces données sont protégées selon la politique de confidentialité et selon les lois applicables.',
  },
  {
    title: '8. Modifications',
    text:
      'Campus Market peut modifier les présentes conditions afin d’améliorer la sécurité, la conformité ou le service. Les nouvelles versions prennent effet dès leur publication sur le site.',
  },
]

export default function ConditionsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-8 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Conditions générales</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Conditions générales d’utilisation</h1>
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-[var(--surface-2)] p-6 md:p-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
            <p className="text-sm leading-7 text-muted-foreground">{section.text}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
