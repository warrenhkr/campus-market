'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return new Date(date).toLocaleDateString('fr-FR')
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return

    setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })))
    setUnreadCount(0)

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      })
    } catch {
      // ignore network errors; state already updated locally
    }
  }, [unreadCount])

  const markOneAsRead = async (id: string) => {
    const wasUnread = notifications.find(notification => notification.id === id && !notification.is_read)
    if (!wasUnread) return

    setNotifications(prev => prev.map(notification => (
      notification.id === id ? { ...notification, is_read: true } : notification
    )))
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch {
      // ignore network errors; state already updated locally
    }
  }

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) {
        setLoading(false)
        return
      }

      const json = await res.json()
      if (json.notifications) {
        setNotifications(json.notifications)
        setUnreadCount(json.notifications.filter((n: Notification) => !n.is_read).length)
      }
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!open || unreadCount === 0) return
    void markAllAsRead()
  }, [open, unreadCount, markAllAsRead])

  if (loading || notifications.length === 0 && unreadCount === 0) {
    // On garde quand même la cloche visible même sans notifs, juste sans badge
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
      >
        <Bell size={16} style={{ color: 'var(--foreground)' }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
              flex items-center justify-center text-[10px] font-bold"
            style={{ background: '#F87171', color: 'white' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-30 w-80 rounded-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  Notifications
                </p>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        void markAllAsRead()
                      }}
                      className="text-[10px] font-semibold rounded-full px-2 py-1 transition-colors"
                      style={{ background: '#F8717118', color: '#F87171' }}
                    >
                      Tout marquer lu
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded-full"
                      style={{ background: '#F8717118', color: '#F87171' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => void markOneAsRead(notif.id)}
                      className="flex w-full gap-3 px-4 py-3 text-left transition-all duration-200 hover:bg-primary/10"
                      style={{
                        background: notif.is_read ? 'transparent' : 'var(--primary-dim)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: notif.is_read ? 'var(--subtle)' : 'var(--primary)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate"
                          style={{ color: 'var(--foreground)' }}>
                          {notif.title}
                        </p>
                        <p className="text-xs mt-0.5 line-clamp-2"
                          style={{ color: 'var(--muted-foreground)' }}>
                          {notif.message}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--subtle)' }}>
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <Bell size={24} className="mx-auto mb-2" style={{ color: 'var(--subtle)' }} />
                    <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                      Aucune notification
                    </p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <Link
                  href="/account/notifications"
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs font-semibold py-3 transition-colors"
                  style={{ color: 'var(--primary)', borderTop: '1px solid var(--border)' }}
                >
                  Voir toutes les notifications →
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}