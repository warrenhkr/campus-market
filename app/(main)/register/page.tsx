'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ShoppingBag, Eye, EyeOff, Check, GraduationCap, Store } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { register } from '@/actions/auth'
import { toast } from 'sonner'

const UNIVERSITES_PUBLIQUES: Record<string, string[]> = {
  'UAC — Université d\'Abomey-Calavi': [
    'FASEG — Faculté des Sciences Économiques et de Gestion',
    'FAST — Faculté des Sciences et Techniques',
    'FADESP — Faculté de Droit et Science Politique',
    'FLLAC — Faculté des Lettres, Langues, Arts et Communication',
    'FASHS — Faculté des Sciences Humaines et Sociales',
    'FSS — Faculté des Sciences de la Santé',
    'FSA — Faculté des Sciences Agronomiques',
    'EPAC — École Polytechnique d\'Abomey-Calavi',
    'ENA — École Nationale d\'Administration',
    'ENEAM — École Nationale d\'Économie Appliquée et de Management',
    'ENSTIC — École Nationale Sup. des TIC',
    'ENS — École Normale Supérieure',
    'IFRI — Institut de Formation et Recherche en Informatique',
    'IMSP — Institut de Mathématiques et Sciences Physiques',
    'INMeS — Institut National Médico-Sanitaire',
    'Autre',
  ],
  'UP — Université de Parakou': [
    'FA — Faculté d\'Agronomie',
    'FM — Faculté de Médecine',
    'FDSP — Faculté de Droit et Science Politique',
    'FASEG — Faculté des Sciences Économiques et de Gestion',
    'FLASH — Faculté des Lettres, Arts et Sciences Humaines',
    'IUT — Institut Universitaire de Technologie',
    'ENSAGAP — École Nat. Sup. d\'Aménagement des Aires Protégées',
    'ENSPD — École Nat. Sup. de Statistique et Démographie',
    'ENSAP — École Nat. Sup. Agropastorale',
    'IFSIO — Institut de Formation en Soins Infirmiers et Obstétriques',
    'Autre',
  ],
  'UNSTIM — Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques': [
    'INSTI — Institut Supérieur de Technologie Industrielle',
    'INSPEI — Institut Sup. des Classes Préparatoires aux Grandes Écoles d\'Ingénieur',
    'FAST-UNSTIM — Faculté des Sciences et Techniques',
    'ENSTP — École Nat. Sup. des Travaux Publics',
    'ENSGMM — École Nat. Sup. de Génie Mathématique et Modélisation',
    'ENSGEP — École Nat. Sup. de Génie Énergétique et Procédés',
    'ENSET — École Normale Sup. de l\'Enseignement Technique',
    'ENSBBA — École Nat. Sup. de Biosciences et Biotechnologies Appliquées',
    'École Normale Sup. de Natitingou',
    'École Doctorale des STIM',
    'Autre',
  ],
  'UNA — Université Nationale d\'Agriculture': [
    'EHAEV — École d\'Horticulture et Aménagement des Espaces Verts',
    'EGPVS — École de Gestion et Production Végétale',
    'EGR — École de Génie Rural',
    'ESTCTPA — École des Sciences et Tech. de Conservation et Transformation des Produits Agricoles',
    'École d\'Aquaculture',
    'EGESE — École de Gestion et Exploitation des Systèmes d\'Élevage',
    'EForT — École de Foresterie Tropicale',
    'EAPA — École d\'Agrobusiness et Politiques Agricoles',
    'ESRVA — École de Sociologie Rurale et Vulgarisation Agricole',
    'Autre',
  ],
  'UADC — Université Africaine de Développement Coopératif': [
    'Formation en Économie Coopérative',
    'Formation en Microfinance',
    'Autre',
  ],
}

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accountType, setAccountType] = useState<'student' | 'seller'>('student')
  const [etablissementType, setEtablissementType] = useState<'public' | 'private'>('public')
  const [selectedUniversity, setSelectedUniversity] = useState('')

  const checks = [
    { label: '6 caractères minimum', ok: password.length >= 6 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre', ok: /[0-9]/.test(password) },
  ]

  const passwordsMatch = confirm.length > 0 && password === confirm
  const faculties = selectedUniversity ? UNIVERSITES_PUBLIQUES[selectedUniversity] ?? [] : []

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    const formData = new FormData(e.currentTarget)
    formData.set('account_type', accountType)
    formData.set('etablissement_type', etablissementType)
    startTransition(async () => {
      try {
        const result = await register(formData)
        if (result?.success === false) {
          toast.error(result.error ?? 'Erreur lors de l\'inscription')
        } else {
          toast.success('Compte créé avec succès 🎉')
          router.push('/account')
          setTimeout(() => router.refresh(), 100)
        }
      } catch {
        toast.error('Une erreur est survenue')
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96
        rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: 'var(--primary)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)' }}>
            <ShoppingBag size={18} style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
            Campus Market
          </span>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            Créer un compte
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Rejoins la marketplace de ton campus 🎓
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom complet */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Nom complet
              </label>
              <Input name="name" type="text" placeholder="John Doe" required className="h-10"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <Input name="email" type="email" placeholder="toi@email.com" required className="h-10"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Téléphone WhatsApp
              </label>
              <Input name="phone" type="tel" placeholder="+229 XX XX XX XX" required className="h-10"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
            </div>

            {/* Type d'établissement */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Type d&apos;établissement
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'public', label: 'Université publique' },
                  { value: 'private', label: 'Université privée' },
                ].map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => {
                      setEtablissementType(value as 'public' | 'private')
                      setSelectedUniversity('')
                    }}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: etablissementType === value ? 'var(--primary-dim)' : 'var(--surface-2)',
                      border: `1px solid ${etablissementType === value ? 'var(--primary)' : 'var(--border)'}`,
                      color: etablissementType === value ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Université */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Université
              </label>
              {etablissementType === 'public' ? (
                <select
                  name="university"
                  required
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl outline-none h-10"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="">Sélectionne ton université</option>
                  {Object.keys(UNIVERSITES_PUBLIQUES).map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              ) : (
                <Input name="university" type="text" placeholder="Nom de ton université privée" required className="h-10"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
              )}
            </div>

            {/* Filière */}
            {etablissementType === 'public' && faculties.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Filière / École
                </label>
                <select
                  name="filiere"
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl outline-none h-10"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                  <option value="">Sélectionne ta filière</option>
                  {faculties.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Type de compte */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Tu veux
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'student', label: 'Acheter', icon: GraduationCap },
                  { value: 'seller', label: 'Vendre', icon: Store },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => setAccountType(value as 'student' | 'seller')}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                    style={{
                      background: accountType === value ? 'var(--primary-dim)' : 'var(--surface-2)',
                      border: `1px solid ${accountType === value ? 'var(--primary)' : 'var(--border)'}`,
                      color: accountType === value ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}>
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <Input name="password" type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" required className="h-10 pr-10"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  {checks.map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <Check size={12} style={{ color: ok ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                      <span style={{ color: ok ? 'var(--primary)' : 'var(--muted-foreground)' }}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Input name="confirm_password" type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••" required className="h-10 pr-10"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && (
                <p className="text-xs" style={{ color: passwordsMatch ? 'var(--primary)' : '#ef4444' }}>
                  {passwordsMatch ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isPending} className="w-full h-11 font-semibold mt-2"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {isPending ? 'Création en cours...' : 'Créer mon compte'}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
            Déjà un compte ?{' '}
            <Link href="/login" className="font-medium" style={{ color: 'var(--primary)' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}