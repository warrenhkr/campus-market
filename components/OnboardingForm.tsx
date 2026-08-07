'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveOnboarding } from '@/actions/auth'
import { ETABLISSEMENTS_BENIN } from '@/lib/data/etablissements-benin'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Constantes dérivées pour les types
type Universite = (typeof ETABLISSEMENTS_BENIN)[number]
type Faculte = Universite['facultes'][number]

export function OnboardingForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedUni, setSelectedUni]       = useState<string>('')
  const [selectedFac, setSelectedFac]       = useState<string>('')
  const [selectedFil, setSelectedFil]       = useState<string>('')
  const [customFil, setCustomFil]           = useState<string>('')

  // Données dérivées des sélections
  const universiteData = ETABLISSEMENTS_BENIN.find(u => u.universite === selectedUni) ?? null
  const faculteData    = universiteData?.facultes.find(f => f.nom === selectedFac) ?? null
  const filieres       = (faculteData?.filieres ?? []) as readonly string[]

  const isAutreUni = selectedUni === "Autre / Université privée"
  const isAutreFac = selectedFac === "Autre" || (faculteData !== null && filieres.length === 0)
  const showFreeText = isAutreUni || isAutreFac

  const handleUniChange = (val: string) => {
    setSelectedUni(val)
    setSelectedFac('')
    setSelectedFil('')
    setCustomFil('')
  }

  const handleFacChange = (val: string) => {
    setSelectedFac(val)
    setSelectedFil('')
    setCustomFil('')
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const filiereValue = showFreeText ? customFil.trim() : selectedFil

    if (!selectedUni) {
      toast.error("Sélectionne ton université")
      return
    }
    if (!selectedFac && !isAutreUni) {
      toast.error("Sélectionne ta faculté / école")
      return
    }
    if (!filiereValue) {
      toast.error("Indique ta filière")
      return
    }

    const formData = new FormData()
    formData.set('university', selectedUni)
    formData.set('faculty', isAutreUni ? '' : selectedFac)
    formData.set('filiere', filiereValue)

    startTransition(async () => {
      try {
        const result = await saveOnboarding(formData)
        if (!result.success) {
          toast.error(result.error ?? "Erreur lors de la sauvegarde")
          return
        }
        toast.success("Profil complété ! Bienvenue 🎓")
        router.push('/')
        router.refresh()
      } catch {
        toast.error("Une erreur est survenue")
      }
    })
  }

  // ── Style helpers ──────────────────────────────────────────────────────────
  const selectStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    borderRadius: '0.75rem',
    padding: '0 2.75rem 0 0.875rem',
    height: '2.75rem',
    width: '100%',
    fontSize: '0.875rem',
    appearance: 'none',
    WebkitAppearance: 'none',
    outline: 'none',
    cursor: 'pointer',
  }

  const disabledSelectStyle: React.CSSProperties = {
    ...selectStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    borderRadius: '0.75rem',
    padding: '0 0.875rem',
    height: '2.75rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(163,230,53,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--primary)' }}
          >
            <GraduationCap size={20} style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>
            Campus Market
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            Une dernière étape 🎓
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--muted-foreground)' }}>
            Dis-nous où tu étudies pour personnaliser ton expérience.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ─ Université ─ */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Université
              </label>
              <Select
                value={selectedUni}
                onValueChange={handleUniChange}
              >
                <SelectTrigger className="w-full h-11 bg-[var(--surface-2)] border-[var(--border)] rounded-xl text-sm shadow-none focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Sélectionne ton université" />
                </SelectTrigger>
                <SelectContent>
                  {ETABLISSEMENTS_BENIN.map(u => (
                    <SelectItem key={u.universite} value={u.universite}>{u.universite}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ─ Faculté / École ─ */}
            <AnimatePresence>
              {selectedUni && !isAutreUni && (
                <motion.div
                  key="faculty"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Faculté / École
                  </label>
                  <Select
                    value={selectedFac}
                    onValueChange={handleFacChange}
                    disabled={!selectedUni}
                  >
                    <SelectTrigger className="w-full h-11 bg-[var(--surface-2)] border-[var(--border)] rounded-xl text-sm shadow-none focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Sélectionne ta faculté" />
                    </SelectTrigger>
                    <SelectContent>
                      {universiteData?.facultes.map(f => (
                        <SelectItem key={f.nom} value={f.nom}>{f.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─ Filière — select ou texte libre ─ */}
            <AnimatePresence>
              {(selectedFac || isAutreUni) && (
                <motion.div
                  key="filiere"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Filière
                  </label>

                  {showFreeText ? (
                    <input
                      type="text"
                      value={customFil}
                      onChange={e => setCustomFil(e.target.value)}
                      placeholder="Précise ta filière (ex: Droit, Informatique…)"
                      style={inputStyle}
                    />
                  ) : (
                    <Select
                      value={selectedFil}
                      onValueChange={setSelectedFil}
                      disabled={!selectedFac}
                    >
                      <SelectTrigger className="w-full h-11 bg-[var(--surface-2)] border-[var(--border)] rounded-xl text-sm shadow-none focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Sélectionne ta filière" />
                      </SelectTrigger>
                      <SelectContent>
                        {filieres.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─ Bouton Continuer ─ */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isPending}
              className="w-full h-11 font-semibold rounded-xl flex items-center justify-center gap-2 mt-2 transition-colors"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Enregistrement...
                </>
              ) : 'Continuer →'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--subtle)' }}>
          Ces informations ne sont utilisées que pour personnaliser ton expérience.
        </p>
      </motion.div>
    </div>
  )
}
