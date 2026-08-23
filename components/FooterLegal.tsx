import Link from 'next/link'

export function FooterLegal() {
  return (
    <footer className="border-t border-border bg-[var(--surface-2)]/80">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground">CM</span>
              <span className="text-base font-bold tracking-tight">Campus Market</span>
            </Link>
            <p className="mt-4 leading-6">La marketplace étudiante pour acheter, vendre et faire grandir les talents de chaque campus.</p>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Découvrir</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Découvrir">
              <Link href="/products" className="transition hover:text-foreground">Produits</Link>
              <Link href="/become-seller" className="transition hover:text-foreground">Devenir vendeur</Link>
              <Link href="/help" className="transition hover:text-foreground">Centre d’aide</Link>
            </nav>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Mon compte</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Mon compte">
              <Link href="/login" className="transition hover:text-foreground">Connexion</Link>
              <Link href="/register" className="transition hover:text-foreground">Créer un compte</Link>
              <Link href="/account" className="transition hover:text-foreground">Mon espace</Link>
            </nav>
          </div>

          <div>
            <h2 className="font-semibold text-foreground">Informations</h2>
            <nav className="mt-4 flex flex-col items-start gap-3" aria-label="Informations légales">
              <Link href="/legal" className="transition hover:text-foreground">Mentions légales</Link>
              <Link href="/legal/confidentialite" className="transition hover:text-foreground">Confidentialité</Link>
              <Link href="/legal/conditions" className="transition hover:text-foreground">Conditions d’utilisation</Link>
              <Link href="/legal/vendeur" className="transition hover:text-foreground">Règles vendeur</Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Campus Market. Tous droits réservés.</p>
          <p>Fait pour les étudiants, au Bénin.</p>
        </div>
      </div>
    </footer>
  )
}
