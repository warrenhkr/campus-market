'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ImageUpload'

type DocMeta = {
  url: string
  public_id?: string
  resource_type?: string
  format?: string
  width?: number | null
  height?: number | null
  bytes?: number | null
  type?: string
}

export default function SellerKycForm() {
  const [status, setStatus] = useState<string | null>(null)
  const [documents, setDocuments] = useState<DocMeta[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // load existing status and documents
    let mounted = true
    fetch('/api/seller/verification')
      .then(async (res) => {
        const json = await res.json()
        if (!mounted) return
        if (!res.ok) {
          console.error('KYC fetch error', json)
          return
        }
        setStatus(json.verificationStatus ?? null)
        const docs = Array.isArray(json.documents) ? json.documents : []
        setDocuments(docs.map((d: any) => ({ url: d.url, type: d.type })))
      })
      .catch((err) => console.error('KYC fetch failed', err))
    return () => { mounted = false }
  }, [])

  const upsertDoc = (index: number, meta: DocMeta | null) => {
    setDocuments((prev) => {
      const next = [...prev]
      if (meta) next[index] = meta
      else next.splice(index, 1)
      return next
    })
  }

  const handleAddEmpty = () => {
    setDocuments((d) => [...d, { url: '', type: `document-${d.length + 1}` }])
  }

  const handleSubmit = async () => {
    if (!documents.length) {
      toast.error('Ajoute au moins un document avant de soumettre')
      return
    }

    const payloadDocs = documents
      .map((d) => d?.url ? ({ url: d.url, public_id: d.public_id, resource_type: d.resource_type, format: d.format, width: d.width, height: d.height, bytes: d.bytes, type: d.type }) : null)
      .filter(Boolean)

    if (!payloadDocs.length) {
      toast.error('Ajoute au moins un document valide avant de soumettre')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: payloadDocs }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error('KYC submit error', json)
        toast.error(json?.error || 'Erreur lors de la soumission')
        return
      }
      setStatus(json.verificationStatus ?? 'PENDING')
      toast.success(json?.message || 'Documents enregistrés')
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
          Vérification KYC
        </p>
        <h2 className="text-2xl font-bold text-foreground">Vérifier votre identité</h2>
        <p className="mt-1 text-sm text-muted-foreground">Avant le premier retrait, merci de soumettre une pièce d'identité et une photo si demandée.</p>
      </div>

      <Card className="rounded-3xl border border-border">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <p className="text-sm text-muted-foreground">Statut actuel: <strong className="ml-2">{status ?? '—'}</strong></p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: Math.max(1, documents.length) }).map((_, i) => (
                <div key={i}>
                  <label className="text-sm text-muted-foreground mb-2 block">Document {i + 1}</label>
                  <ImageUpload
                    value={documents[i]?.url ?? null}
                    onChange={(url) => upsertDoc(i, url ? { ...(documents[i] ?? {}), url } : null)}
                    onMeta={(meta) => meta ? upsertDoc(i, { ...(documents[i] ?? {}), ...meta }) : upsertDoc(i, null)}
                    bucket="kyc"
                  />
                </div>
              ))}

              <div className="col-span-full">
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" onClick={handleAddEmpty}>Ajouter un document</Button>
                  <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Envoi...' : 'Soumettre pour vérification'}</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
