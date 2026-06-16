'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CancelPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: '#F8717118', border: '2px solid #F87171' }}
        >
          <XCircle size={36} style={{ color: '#F87171' }} />
        </motion.div>

        <h1 className="text-3xl font-extrabold mb-3"
          style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
          Paiement annulé
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
          Ton paiement n'a pas abouti. Ton panier est toujours disponible, tu peux réessayer.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/account/checkout"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            <RefreshCw size={16} />
            Réessayer
          </Link>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-70"
            style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={14} /> Retour aux produits
          </Link>
        </div>
      </motion.div>
    </div>
  )
}