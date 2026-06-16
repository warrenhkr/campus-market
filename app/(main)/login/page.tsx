'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/actions/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

 const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  startTransition(async () => {
    try {
      const result = await login(formData)
      if (result?.success === false) {
        toast.error(result.error ?? 'Erreur de connexion')
      } else {
        window.location.href = '/account'

      }
    } catch {
      toast.error('Une erreur est survenue')
    }
  })
}

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96
          rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: 'var(--primary)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm relative"
      >
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--primary)' }}
          >
            <ShoppingBag size={18} style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <span className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
            Campus Market
          </span>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>
            Connexion
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Content de te revoir 👋
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="toi@email.com"
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
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="h-10 pr-10"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--subtle)' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 font-semibold"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : 'Se connecter'}
              </Button>
            </motion.div>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted-foreground)' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
            S&apos;inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  )
}