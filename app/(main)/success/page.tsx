import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}>
      <AnimatedSection>
        <div
          className="w-full max-w-md rounded-3xl p-10 text-center"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--primary-border)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}
          >
            <CheckCircle size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-2xl font-extrabold mb-2"
            style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
            Paiement réussi ! 🎉
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
            Ta commande a été confirmée. Tu recevras une notification dès que le vendeur l&apos;aura traitée.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="flex items-center justify-center py-3 rounded-xl text-sm font-bold
                transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Voir mes commandes
            </Link>
            <Link
              href="/products"
              className="flex items-center justify-center py-3 rounded-xl text-sm font-medium
                transition-all hover:scale-105"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}