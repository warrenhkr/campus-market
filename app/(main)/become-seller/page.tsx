// app/(main)/become-seller/page.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Store, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const PERKS = [
  { emoji: '🛒', title: 'Vends tes produits', desc: 'Mets en vente tout ce que tu veux en quelques minutes.' },
  { emoji: '💰', title: 'Reçois tes paiements', desc: 'Paiements sécurisés via FedaPay directement sur ton compte.' },
  { emoji: '📊', title: 'Suis tes stats', desc: 'Dashboard vendeur avec statistiques en temps réel.' },
  { emoji: '🎓', title: 'Communauté étudiante', desc: 'Vends exclusivement à des étudiants vérifiés.' },
]

export default function BecomeSellerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [shopName, setShopName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shopName.trim()) return toast.error('Le nom de ta boutique est requis.')

    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Tu dois être connecté.')
        router.push('/login')
        return
      }

      const res = await fetch('/api/become-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Une erreur est survenue.')
        return
      }

      setStep('success')
    })
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <div
            className="rounded-3xl p-10"
            style={{ background: 'var(--surface)', border: '1px solid var(--primary-border)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}
            >
              <CheckCircle size={32} style={{ color: 'var(--primary)' }} />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Demande envoyée ! 🎉
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
              Ton dossier est en cours d&apos;examen par notre équipe.
              Tu recevras une notification dès que ta boutique sera approuvée.
            </p>

            <Button
              onClick={() => router.push('/')}
              className="w-full font-semibold"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Retour à l&apos;accueil
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--background)' }}>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-48
            blur-[100px] opacity-10 pointer-events-none"
          style={{ background: 'var(--primary)' }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedSection className="text-center max-w-2xl mx-auto">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                text-xs font-semibold mb-6"
              style={{
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <Store size={11} />
              Devenir vendeur
            </div>
            <h1
              className="text-4xl md:text-5xl font-extrabold mb-4"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.03em' }}
            >
              Ouvre ta boutique sur Campus Market
            </h1>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Vends tes produits et services à des milliers d&apos;étudiants.
              Gratuit pour commencer.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Perks */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {PERKS.map(({ emoji, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl p-6"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <span className="text-2xl mb-3 block">{emoji}</span>
                <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Form */}
          <div className="max-w-lg mx-auto">
            <AnimatedSection>
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                  Créer ma boutique
                </h2>
                <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                  Ta demande sera examinée par notre équipe sous 24h.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Nom de ta boutique <span style={{ color: 'var(--primary)' }}>*</span>
                    </label>
                    <Input
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="Ex: Tech by Warren"
                      required
                      className="h-10"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      Description <span style={{ color: 'var(--subtle)' }}>(optionnel)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décris ce que tu vas vendre..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-xl outline-none resize-none"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                    />
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isPending || !shopName.trim()}
                      className="w-full h-10 font-semibold"
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                      }}
                    >
                      {isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-black/20 border-t-black
                            rounded-full animate-spin" />
                          Envoi en cours...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Soumettre ma demande
                          <ArrowRight size={16} />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}