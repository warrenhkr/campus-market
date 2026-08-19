'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Withdrawal = {
  id: string
  amount: number
  method: string
  account: any
  status: string
  created_at: string
}

export default function SellerWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('MOMO')
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchList()
  }, [])

  async function fetchList() {
    setLoading(true)
    try {
      const res = await fetch('/api/seller/withdrawals')
      const json = await res.json()
      if (!res.ok) {
        console.error('withdrawals fetch error', json)
        toast.error(json?.error || 'Erreur lors du chargement')
        return
      }
      setWithdrawals(json.withdrawals ?? [])
    } catch (err) {
      console.error(err)
      toast.error('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async () => {
    const amt = Number(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('Montant invalide')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, method, account: { raw: account } }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error('withdrawal create error', json)
        toast.error(json?.error || 'Erreur lors de la demande')
        return
      }
      toast.success('Demande de retrait créée')
      setAmount('')
      setAccount('')
      fetchList()
    } catch (err) {
      console.error(err)
      toast.error('Erreur réseau')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-sm text-muted-foreground">
          Retraits
        </p>
        <h2 className="text-2xl font-bold text-foreground">Gérer vos retraits</h2>
        <p className="mt-1 text-sm text-muted-foreground">Demande de retrait vers Moov ou MTN Mobile Money.</p>
      </div>

      <Card className="rounded-3xl border border-border mb-6">
        <CardHeader>
          <CardTitle>Nouvelle demande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Montant</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 1000" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Méthode</label>
              <Select onValueChange={(v) => setMethod(v)} defaultValue={method}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Méthode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOMO">MTN Mobile Money</SelectItem>
                  <SelectItem value="MOOV">Moov Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Compte / Téléphone</label>
              <Input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="Numéro Mobile" />
            </div>

            <div className="col-span-full flex gap-2 mt-3">
              <Button variant="outline" onClick={fetchList} disabled={loading}>Rafraîchir</Button>
              <Button onClick={handleRequest} disabled={submitting}>{submitting ? 'Envoi...' : 'Demander un retrait'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-border">
        <CardHeader>
          <CardTitle>Historique des demandes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande de retrait pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="text-sm font-medium">{w.method} — {w.amount} {''}</div>
                    <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm font-semibold">{w.status}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
