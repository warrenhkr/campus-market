'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'

type ReportItem = {
  id: string
  reason: string
  description: string | null
  status: ReportStatus
  resolution: string | null
  created_at: string
  reporter?: {
    id: string
    name: string | null
    email: string | null
  }
  seller?: {
    id: string
    shop_name: string | null
  }
  product?: {
    id: string
    name: string | null
  }
}

const statusColors: Record<ReportStatus, string> = {
  PENDING: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  INVESTIGATING: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
  RESOLVED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  DISMISSED: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
}

export function ReportModerationBoard() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState('Chargement des signalements…')

  const summary = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) => report.status === 'PENDING').length,
      investigating: reports.filter((report) => report.status === 'INVESTIGATING').length,
      resolved: reports.filter((report) => report.status === 'RESOLVED').length,
    }
  }, [reports])

  const loadReports = async () => {
    try {
      const res = await fetch('/api/admin/reports', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error ?? 'Impossible de charger les signalements.')
        return
      }

      setReports(Array.isArray(json.reports) ? json.reports : [])
      setMessage('Modération prête.')
    } catch (error) {
      console.error('Failed to load reports', error)
      setMessage('Erreur de connexion avec l’API de modération.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const updateStatus = async (reportId: string, status: ReportStatus) => {
    setBusyId(reportId)
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          status,
          resolution:
            status === 'RESOLVED'
              ? 'Signalement traité et action prise selon la politique de modération.'
              : status === 'DISMISSED'
                ? 'Signalement classé sans action, faute de motif valable.'
                : 'Signalement en cours d’examen.',
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error ?? 'Erreur lors du traitement du signalement.')
        return
      }

      setMessage('Signalement mis à jour.')
      await loadReports()
    } catch (error) {
      console.error('Failed to update report', error)
      setMessage('Le traitement du signalement a échoué.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: summary.total },
          { label: 'En attente', value: summary.pending },
          { label: 'En cours', value: summary.investigating },
          { label: 'Traités', value: summary.resolved },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-3xl border border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Modération marketplace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
            {message}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement des signalements…</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun signalement pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-border bg-[var(--surface-2)] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-base font-semibold text-foreground">{report.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.reporter?.name ?? report.reporter?.email ?? 'Utilisateur'} • {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p>
                      <span className="font-medium text-foreground">Boutique :</span>{' '}
                      {report.seller?.shop_name ?? '—'}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Produit :</span>{' '}
                      {report.product?.name ?? '—'}
                    </p>
                  </div>

                  {report.description && (
                    <p className="mt-3 rounded-xl border border-border bg-background/50 p-3 text-sm text-muted-foreground">
                      {report.description}
                    </p>
                  )}

                  {report.resolution && (
                    <p className="mt-2 text-xs text-muted-foreground">Décision : {report.resolution}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(report.id, 'INVESTIGATING')}
                      disabled={busyId === report.id}
                    >
                      {busyId === report.id ? '…' : 'Examiner'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateStatus(report.id, 'RESOLVED')}
                      disabled={busyId === report.id}
                    >
                      Résoudre
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(report.id, 'DISMISSED')}
                      disabled={busyId === report.id}
                    >
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
