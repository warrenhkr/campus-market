'use client'

import { useState } from 'react'
import { Check, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'

export function ShareLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien de boutique copié !')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Impossible de copier le lien.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold transition-all hover:border-primary/60 hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      {copied ? 'Copié' : 'Copier le lien'}
    </button>
  )
}
