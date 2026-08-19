'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/actions/auth'
import { toast } from 'sonner'
import { GoogleLoginButton } from '@/components/GoogleLoginButton'

export default function LoginPage() {
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
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'var(--background)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] relative"
      >
        <div className="flex flex-col items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ background: 'var(--primary)' }}
          >
            <ShoppingBag size={20} style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <span className="font-semibold text-xl tracking-tight" style={{ color: 'var(--foreground)' }}>
            Campus Market
          </span>
        </div>

        <div
          className="rounded-xl p-6 sm:p-8 shadow-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h1 className="text-2xl font-semibold tracking-tight mb-1.5" style={{ color: 'var(--foreground)' }}>
            Connexion
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Content de te revoir 👋
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Email
              </label>
              <Input
                name="email"
                type="email"
                required
                className="h-11 rounded-md"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="h-11 pr-10 rounded-md"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 font-medium rounded-md mt-6 shadow-none"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </Button>
          </form>

          <div className="my-6 flex items-center justify-center gap-4">
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
              ou
            </span>
            <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          </div>

          <GoogleLoginButton />
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
            S&apos;inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  )
}