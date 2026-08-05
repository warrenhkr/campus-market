'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Bell, Package, ShoppingCart,
  CreditCard, Headphones, AlertCircle, CheckCheck, Trash2,
} from 'lucide-react'
import { AnimatedSection } from '@/components/AnimatedSection'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  metadata?: Record<string, unknown>
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  ORDER:         { icon: ShoppingCart, color: '#3B82F6' },
  PAYMENT:       { icon: CreditCard,   color: '#10B981' },
  PRODUCT:       { icon: Package,      color: '#A3E635' },
  SUPPORT:       { icon: Headphones,   color: '#F59E0B' },
  ALERT:         { icon: AlertCircle,  color: '#F87171' },
  DEFAULT:       { icon: Bell,         color: '#8B5CF6' },
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `il y a ${days}j`
  return new Date(date).toLocaleDateString('fr-FR')
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })

      setNotifications(data ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    })
  }

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .eq('is_read', false)

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      toast.success('Toutes les notifications marquées comme lues')
    })
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    startTransition(async () => {
      const supabase = createClient()
      await supabase.from('notifications').delete().eq('id', id)
    })
  }

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <AnimatedSection delay={0}>
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/account"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <ArrowLeft size={16} style={{ color: 'var(--foreground)' }} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold"
              style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              Notifications
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: 'var(--primary-dim)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
              }}
            >
              <CheckCheck size={13} />
              Tout marquer lu
            </button>
          )}
        </div>
      </AnimatedSection>

      {/* Filtres */}
      <AnimatedSection delay={0.05}>
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'unread', label: 'Non lues' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as 'all' | 'unread')}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: filter === key ? 'var(--primary)' : 'var(--surface-2)',
                color: filter === key ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </AnimatedSection>

      {/* Liste */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif, i) => {
              const config = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.DEFAULT
              const Icon = config.icon

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                >
                  <div
                    className="rounded-2xl p-4 flex items-start gap-3 group transition-all"
                    style={{
                      background: notif.is_read ? 'var(--surface)' : 'var(--primary-dim)',
                      border: `1px solid ${notif.is_read ? 'var(--border)' : 'var(--primary-border)'}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${config.color}18` }}
                    >
                      <Icon size={16} style={{ color: config.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${notif.is_read ? '' : ''}`}
                          style={{ color: notif.is_read ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                            style={{ background: 'var(--primary)' }} />
                        )}
                      </div>
                      <p className="text-xs mt-1 leading-relaxed"
                        style={{ color: 'var(--subtle)' }}>
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs" style={{ color: 'var(--subtle)' }}>
                          {timeAgo(notif.created_at)}
                        </span>
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-xs font-medium"
                              style={{ color: 'var(--primary)' }}
                            >
                              Marquer lu
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notif.id)}
                            className="text-xs"
                            style={{ color: '#F87171' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <AnimatedSection>
          <div
            className="rounded-2xl p-16 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Bell size={40} className="mx-auto mb-4" style={{ color: 'var(--subtle)' }} />
            <p className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Tu seras notifié ici pour tes commandes, paiements et plus.
            </p>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}