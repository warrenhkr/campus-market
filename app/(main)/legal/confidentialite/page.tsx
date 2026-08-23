const sections = [
  {
    title: '1. Données collectées',
    text:
      'Campus Market collecte les informations nécessaires à la création de compte, à la commande, à la vente, à la sécurité et au support client. Cela inclut notamment les informations de profil, les données de paiement et les documents ou médias liés à la boutique.',
  },
  {
    title: '2. Finalités du traitement',
    text:
      'Les données sont utilisées pour gérer les comptes, traiter les commandes, sécuriser les paiements, faciliter les échanges entre acheteurs et vendeurs, prévenir la fraude et améliorer la plateforme.',
  },
  {
    title: '3. Partage des données',
    text:
      'Les données peuvent être partagées avec les prestataires techniques et de paiement nécessaires au fonctionnement de la plateforme. Campus Market ne vend pas les données personnelles à des tiers à des fins commerciales.',
  },
  {
    title: '4. Conservation',
    text:
      'Les données sont conservées pendant la durée nécessaire aux finalités du service, ainsi que selon les obligations légales applicables, notamment en matière de facturation, de litiges et de sécurité.',
  },
  {
    title: '5. Droits des utilisateurs',
    text:
      'Les utilisateurs peuvent demander l’accès, la rectification, la suppression ou la limitation du traitement de leurs données, sous réserve des obligations de conservation liées à la sécurité et à la conformité.',
  },
  {
    title: '6. Sécurité',
    text:
      'Campus Market met en place des mesures raisonnables pour protéger les données contre l’accès non autorisé, la perte et les altérations. Toutefois, aucun système n’est totalement exempt de risque et les utilisateurs doivent également protéger leurs identifiants.',
  },
  {
    title: '7. Cookies',
    text:
      'Le site peut utiliser des cookies techniques et analytiques afin d’améliorer l’expérience, maintenir la session et évaluer l’usage de la plateforme. Les préférences de cookies peuvent être gérées depuis le navigateur.',
  },
]

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-8 space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Politique de confidentialité</p>
        <h1 className="text-4xl font-black tracking-tight text-foreground">Protection des données et vie privée</h1>
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
