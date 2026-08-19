'use client'

import { useEffect, useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type ExportType = 'orders' | 'customers'
type ExportFormat = 'csv' | 'xlsx'
type ExportStatus = 'all' | 'pending' | 'completed' | 'abandoned' | 'failed'

const STATUS_OPTIONS: Array<{ value: ExportStatus; label: string }> = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'completed', label: 'Terminé' },
  { value: 'abandoned', label: 'Abandonné' },
  { value: 'failed', label: 'Échoué' },
]

export function ExportPanel() {
  const [type, setType] = useState<ExportType>('orders')
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [status, setStatus] = useState<ExportStatus>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [productId, setProductId] = useState<string>('all')
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch('/api/seller/products')
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts((data.products ?? []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))))
      .catch(() => setProducts([]))
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ type, format, status })
      if (from) params.set('from', from)
      if (to) params.set('to', to)
      if (productId !== 'all') params.set('product_id', productId)

      const res = await fetch(`/api/seller/export?${params.toString()}`)
      if (!res.ok) throw new Error('export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="(.+)"/)
      a.download = match?.[1] ?? `export.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // silencieux volontairement — un message d'erreur générique suffit ici,
      // l'export est une action secondaire non bloquante pour le vendeur
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Export de données</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Télécharge tes commandes ou tes clients pour analyse hors plateforme.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Type de données</label>
          <Select value={type} onValueChange={(value) => setType(value as ExportType)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="orders">Commandes / ventes</SelectItem>
              <SelectItem value="customers">Clients</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Format</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: format === 'csv' ? 'var(--primary)' : 'var(--border)',
                background: format === 'csv' ? 'var(--primary-dim)' : 'var(--surface-2)',
                color: format === 'csv' ? 'var(--primary)' : 'var(--foreground)',
              }}
            >
              <FileText size={15} /> CSV
            </button>
            <button
              type="button"
              onClick={() => setFormat('xlsx')}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors"
              style={{
                borderColor: format === 'xlsx' ? 'var(--primary)' : 'var(--border)',
                background: format === 'xlsx' ? 'var(--primary-dim)' : 'var(--surface-2)',
                color: format === 'xlsx' ? 'var(--primary)' : 'var(--foreground)',
              }}
            >
              <FileSpreadsheet size={15} /> Excel
            </button>
          </div>
        </div>

        {type === 'orders' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Statut</label>
            <Select value={status} onValueChange={(value) => setStatus(value as ExportStatus)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {type === 'orders' && products.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Produit</label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Du</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Au</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10" />
        </div>
      </div>

      <Button type="button" onClick={handleExport} disabled={exporting} className="w-full sm:w-auto">
        <Download size={15} className="mr-2" />
        {exporting ? 'Génération...' : 'Télécharger l’export'}
      </Button>
    </div>
  )
}
