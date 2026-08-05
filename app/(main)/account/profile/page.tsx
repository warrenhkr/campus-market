'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Mail, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Profile {
  id: string
  name: string | null
  email: string
  role: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isPasswordPending, startPasswordTransition] = useTransition()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data)
        setName(data.name ?? '')
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSaveName = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', profile!.id)

      if (error) {
        toast.error('Erreur lors de la sauvegarde')
        return
      }

      setProfile(prev => prev ? { ...prev, name } : prev)
      setSaved(true)
      toast.success('Nom mis à jour ✅')
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    startPasswordTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Mot de passe mis à jour ✅')
      setCurrentPassword('')
      setNewPassword('')
    })
  }

  const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    USER:   { label: 'Acheteur',       color: '#3B82F6' },
    SELLER: { label: 'Vendeur',        color: '#A3E635' },
    ADMIN:  { label: 'Administrateur', color: '#F59E0B' },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--background)' }}>
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: 'var(--primary)', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    )
  }

  if (!profile) return null

  const roleInfo = ROLE_LABELS[profile.role] ?? ROLE_LABELS.USER
  const initials = (profile.name ?? profile.email).slice(0, 2).toUpperCase()
  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    month: 'long', year: 'numeric'
  })

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Mon profil
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Membre depuis {memberSince}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Avatar + infos */}
      <AnimatedSection delay={0.1}>
        <div
          className="rounded-2xl p-6 mb-6 flex items-center gap-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)', color: 'var(--primary)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold truncate"
              style={{ color: 'var(--foreground)' }}>
              {profile.name ?? 'Sans nom'}
            </p>
            <p className="text-sm truncate" style={{ color: 'var(--muted-foreground)' }}>
              {profile.email}
            </p>
            <span
              className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1"
              style={{
                background: `${roleInfo.color}18`,
                color: roleInfo.color,
              }}
            >
              {roleInfo.label}
            </span>
          </div>
        </div>
      </AnimatedSection>

      {/* Modifier le nom */}
      <AnimatedSection delay={0.15}>
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Informations personnelles
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: 'var(--muted-foreground)' }}>
                <User size={12} /> Nom complet
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ton nom complet"
                className="h-10"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5"
                style={{ color: 'var(--muted-foreground)' }}>
                <Mail size={12} /> Email
              </label>
              <Input
                value={profile.email}
                disabled
                className="h-10 opacity-50 cursor-not-allowed"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
              <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                L&apos;email ne peut pas être modifié.
              </p>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleSaveName}
                disabled={isPending || name === profile.name}
                className="w-full h-10 font-semibold"
                style={{
                  background: saved ? '#10B981' : 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                {saved ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={16} /> Sauvegardé !
                  </span>
                ) : isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Sauvegarde...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={16} /> Sauvegarder
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Changer le mot de passe */}
      <AnimatedSection delay={0.2}>
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Changer le mot de passe
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="h-10 pr-10"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--subtle)' }}
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleChangePassword}
                disabled={isPasswordPending || !newPassword}
                className="w-full h-10 font-semibold"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                {isPasswordPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Mise à jour...
                  </span>
                ) : 'Changer le mot de passe'}
              </Button>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Devenir vendeur */}
      {profile.role === 'USER' && (
        <AnimatedSection delay={0.25}>
          <div
            className="mt-6 rounded-2xl p-5 flex items-center justify-between gap-4"
            style={{
              background: 'var(--primary-dim)',
              border: '1px solid var(--primary-border)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Tu veux vendre sur Campus Market ?
            </p>
            <Link
              href="/become-seller"
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              Commencer
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}