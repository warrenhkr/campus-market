'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PaymentModeManager() {
  const [mode, setMode] = useState<'sandbox' | 'live'>('sandbox')
  const [liveKeysConfigured, setLiveKeysConfigured] = useState(false)
  const [missingKeys, setMissingKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('Chargement de la configuration…')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/payment-config', { cache: 'no-store' })
        const json = await res.json()
        if (!res.ok) {
          setNote(json?.error ?? 'Impossible de charger la configuration.')
          setLoading(false)
          return
        }

        setMode(json.mode === 'live' ? 'live' : 'sandbox')
        setLiveKeysConfigured(Boolean(json.liveKeysConfigured))
        setMissingKeys(Array.isArray(json.missingKeys) ? json.missingKeys : [])
        setNote(json.note ?? 'Configuration chargée.')
      } catch (error) {
        console.error('Failed to load payment config', error)
        setNote('Impossible de contacter l’API de configuration.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const handleToggleLive = async () => {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/payment-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'live' }),
      })

      const json = await res.json()
      if (!res.ok) {
        setNote(json?.error ?? 'Activation du mode live impossible.')
        return
      }

      const isLive = json.requestedMode === 'live' && Boolean(json.liveEnabled)
      setMode(isLive ? 'live' : 'sandbox')
      setLiveKeysConfigured(Boolean(json.liveKeysConfigured))
      setMissingKeys(Array.isArray(json.missingKeys) ? json.missingKeys : [])
      setNote(json.message ?? 'Configuration enregistrée.')
    } catch (error) {
      console.error('Failed to switch payment mode', error)
      setNote('Erreur lors de la bascule en mode live.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="rounded-3xl border border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Configuration FedaPay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Mode actuel</p>
            <p className="text-xl font-semibold capitalize">{mode}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${mode === 'live' ? 'bg-green-500/15 text-green-600' : 'bg-amber-500/15 text-amber-600'}`}>
            {mode === 'live' ? 'Live' : 'Sandbox'}
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-background/50 p-4 text-sm text-muted-foreground">
          {note}
        </div>

        {!liveKeysConfigured && missingKeys.length > 0 && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
            <p className="font-medium">Clés live manquantes :</p>
            <ul className="mt-2 list-disc pl-5">
              {missingKeys.map((key) => <li key={key}>{key}</li>)}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleToggleLive}
            disabled={busy || loading || mode === 'live' || !liveKeysConfigured}
          >
            {busy ? 'Activation…' : mode === 'live' ? 'Mode live actif' : 'Activer le mode live'}
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Rafraîchir
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Le mode live reste désactivé tant que la validation admin de production n’a pas été faite. La plateforme reste sécurisée en sandbox tant que la configuration n’est pas validée.
        </p>
      </CardContent>
    </Card>
  )
}
