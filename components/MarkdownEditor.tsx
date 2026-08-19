'use client'

import { useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Link2,
  ImageIcon,
  Video,
  Hash,
  Quote,
  Highlighter,
  Sparkles,
  Square,
  RotateCcw,
  RotateCw,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { toast } from 'sonner'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, label = 'Description', placeholder }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [history, setHistory] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addHistoryEntry = (nextValue: string) => {
    setHistory((current) => {
      const next = [...current.slice(0, historyIndex + 1), nextValue]
      return next.slice(-50)
    })
    setHistoryIndex((current) => Math.min(current + 1, 49))
  }

  const setValue = (nextValue: string) => {
    onChange(nextValue)
    addHistoryEntry(nextValue)
  }

  const insertText = (insertValue: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setValue(`${value}${insertValue}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nextValue = `${value.substring(0, start)}${insertValue}${value.substring(end)}`
    setValue(nextValue)

    window.requestAnimationFrame(() => {
      textarea.focus()
      const cursor = start + insertValue.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  const handleUndo = () => {
    if (historyIndex <= 0) return
    const nextIndex = historyIndex - 1
    setHistoryIndex(nextIndex)
    onChange(history[nextIndex])
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const nextIndex = historyIndex + 1
    setHistoryIndex(nextIndex)
    onChange(history[nextIndex])
  }

  const handleLink = () => {
    const url = window.prompt('URL du lien (https://...)')?.trim()
    if (!url) return
    const text = window.prompt('Texte du lien', 'Clique ici')?.trim() ?? url
    insertText(`[${text}](${url})`)
  }

  const handleUpload = async (file: File, isVideo = false) => {
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Fichier trop lourd — max 20MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'product-description-media')

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (!response.ok || !result.url) {
        const message = result?.error?.message || result?.error || 'Échec de l’upload média'
        toast.error(String(message))
        return
      }

      const url = result.url as string
      if (isVideo) {
        insertText(`\n<video controls class="rounded-3xl w-full max-h-[360px]" src="${url}"></video>\n`)
      } else {
        insertText(`\n![Image produit](${url})\n`)
      }
      toast.success('Média ajouté à la description ✅')
    } catch (error) {
      console.error('Upload description media error:', error)
      toast.error('Erreur lors de l’upload du média')
    } finally {
      setUploading(false)
    }
  }

  const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), 'video', 'source', 'div', 'span', 'mark'],
    attributes: {
      ...defaultSchema.attributes,
      video: [...((defaultSchema.attributes?.video as string[]) ?? []), 'src', 'class', 'controls', 'width', 'height', 'poster', 'preload'],
      source: [...((defaultSchema.attributes?.source as string[]) ?? []), 'src', 'type'],
      div: [...((defaultSchema.attributes?.div as string[]) ?? []), 'class'],
      span: [...((defaultSchema.attributes?.span as string[]) ?? []), 'class'],
      mark: [...((defaultSchema.attributes?.mark as string[]) ?? []), 'class'],
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          {label}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <RotateCcw size={14} />
            Annuler
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border bg-[var(--surface-2)] px-3 py-2 text-xs font-semibold transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <RotateCw size={14} />
            Refaire
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('# ')}
          >
            <Hash size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('**gras**')}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('*italique*')}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('<u>texte</u>')}
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('~~texte~~')}
          >
            <Strikethrough size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('- ')}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={handleLink}
          >
            <Link2 size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('> Citation\n')}
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('\n---\n')}
          >
            <Square size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('<span class="text-primary font-semibold">Texte coloré</span>')}
          >
            <Highlighter size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70"
            onClick={() => insertText('<div class="rounded-3xl border border-primary/20 bg-primary-dim p-4">✨ <strong>Offre spéciale :</strong> décris la promesse ici.</div>\n')}
          >
            <Sparkles size={16} />
          </button>
          <label className="cursor-pointer rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70">
            <ImageIcon size={16} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleUpload(file, false)
              }}
              disabled={uploading}
            />
          </label>
          <label className="cursor-pointer rounded-full border border-border bg-[var(--surface-2)] p-2 text-xs font-semibold transition hover:border-primary/70">
            <Video size={16} />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) handleUpload(file, true)
              }}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder ?? 'Utilise le markdown pour formater la description. Ex: **gras**, # Titre, ![image](url)'}
        rows={8}
        className="w-full min-h-[200px] rounded-3xl border border-border bg-[var(--surface-2)] px-4 py-3 text-sm leading-relaxed text-foreground outline-none transition focus:border-primary/70"
        style={{ resize: 'vertical', color: 'var(--foreground)', background: 'var(--surface-2)' }}
      />

      <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Aperçu</span>
          {uploading && <span className="text-xs text-muted-foreground">Upload en cours…</span>}
        </div>
        <div className="prose max-w-full prose-sm prose-headings:text-base prose-p:text-sm prose-a:text-primary prose-img:rounded-3xl prose-img:max-w-full">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}>
            {value || 'La prévisualisation s’affichera ici.'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
