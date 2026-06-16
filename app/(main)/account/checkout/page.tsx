'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, CreditCard, Phone, User, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  shop_name: string
  shop_slug: string
  stock: number
  quantity: number
}

const CART_KEY = 'cm_cart'

export default function CheckoutPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setMounted(true)
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) ?? '[]')
      setItems(cart)
    } catch {
      setItems([])
    }

    // Préremplit email + nom depuis Supabase
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/login')
        return
      }
      setEmail(user.email ?? '')
      supabase.from('users').select('name').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.name) setFullName(data.name)
        })
    })
  }, [router])

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleCheckout = () => {
    if (!phone.trim()) {
      toast.error('Numéro de téléphone requis pour FedaPay')
      return
    }
    if (!fullName.trim()) {
      toast.error('Nom complet requis')
      return
    }
    if (items.length === 0) {
      toast.error('Ton panier est vide')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            total,
            phone,
            fullName,
            email,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error ?? 'Erreur lors du paiement')
          return
        }

        // Redirige vers FedaPay
        if (data.payment_url) {
          localStorage.removeItem(CART_KEY)
          window.location.href = data.payment_url
        }
      } catch {
        toast.error('Une erreur est survenue')
      }
    })
  }

  if (!mounted) {
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

  if (items.length === 0 && mounted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Ton panier est vide
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            text-sm font-bold mt-4 transition-all hover:scale-105"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Explorer les produits
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account/cart"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Finaliser la commande
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Paiement sécurisé via FedaPay
            </p>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Formulaire */}
        <div className="lg:col-span-3 space-y-6">

          {/* Infos personnelles */}
          <AnimatedSection delay={0.1}>
            <div
              className="rounded-2xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}>
                <User size={15} style={{ color: 'var(--primary)' }} />
                Informations personnelles
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium"
                    style={{ color: 'var(--muted-foreground)' }}>
                    Nom complet
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="h-10"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium"
                    style={{ color: 'var(--muted-foreground)' }}>
                    Email
                  </label>
                  <Input
                    value={email}
                    disabled
                    className="h-10 opacity-50"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Paiement FedaPay */}
          <AnimatedSection delay={0.15}>
            <div
              className="rounded-2xl p-6"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ color: 'var(--foreground)' }}>
                <Phone size={15} style={{ color: 'var(--primary)' }} />
                Numéro Mobile Money
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-medium"
                  style={{ color: 'var(--muted-foreground)' }}>
                  Numéro de téléphone (MTN / Moov)
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+229 XX XX XX XX"
                  type="tel"
                  className="h-10"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                  Tu recevras une notification sur ce numéro pour confirmer le paiement.
                </p>
              </div>

              {/* Logos opérateurs */}
              <div className="flex items-center gap-3 mt-4">
                {['MTN MoMo', 'Moov Money', 'Celtis Cash'].map((op) => (
                  <div
                    key={op}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {op}
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Sécurité */}
          <AnimatedSection delay={0.2}>
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
              }}
            >
              <CheckCircle size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Paiement 100% sécurisé via FedaPay. Tes données bancaires ne sont jamais stockées.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Résumé commande */}
        <div className="lg:col-span-2">
          <AnimatedSection delay={0.1}>
            <div
              className="rounded-2xl overflow-hidden sticky top-24"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h2 className="text-sm font-bold flex items-center gap-2"
                  style={{ color: 'var(--foreground)' }}>
                  <ShoppingCart size={15} style={{ color: 'var(--primary)' }} />
                  Récapitulatif ({items.length})
                </h2>
              </div>

              {/* Items */}
              <div className="divide-y max-h-64 overflow-y-auto"
                style={{ borderColor: 'var(--border)' }}>
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div
                      className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0
                        flex items-center justify-center"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-lg">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate"
                        style={{ color: 'var(--foreground)' }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                        × {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold flex-shrink-0"
                      style={{ color: 'var(--foreground)' }}>
                      {new Intl.NumberFormat('fr-FR').format(item.price * item.quantity)} FCFA
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    Total
                  </span>
                  <span className="text-xl font-extrabold" style={{ color: 'var(--primary)' }}>
                    {new Intl.NumberFormat('fr-FR').format(total)} FCFA
                  </span>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={handleCheckout}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
                      text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      boxShadow: '0 0 20px rgba(163,230,53,0.2)',
                    }}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Redirection...
                      </span>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        Payer {new Intl.NumberFormat('fr-FR').format(total)} FCFA
                      </>
                    )}
                  </button>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}