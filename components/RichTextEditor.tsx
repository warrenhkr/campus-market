'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { AnimatePresence, motion } from 'framer-motion'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Focus from '@tiptap/extension-focus'
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Quote,
  Minus,
  Video,
  Plus,
  X,
  Palette,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Maximize2,
  Minimize2,
  Loader2,
  Check,
  Sparkles,
  Code2,
  Eraser,
} from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TiptapVideo, CallToAction } from '@/components/RichTextExtensions'
import { TextStyleAttributes } from '@/components/TextStyleAttributes'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  /** Limite de caractères recommandée pour une fiche produit Campus Market (0 = illimité) */
  characterLimit?: number
}

type PanelId = 'block' | 'align' | 'color' | null

const parseRichTextValue = (value: string | null | undefined) => {
  if (!value) return ''
  try {
    const json = JSON.parse(value)
    if (typeof json === 'object' && json !== null) return json
  } catch {
    return value
  }
  return value
}

const FONT_FAMILIES = [
  { label: 'Défaut', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
{ label: 'Poppins', value: 'Poppins, sans-serif' },
{ label: 'Lora', value: 'Lora, serif' },
{ label: 'Georgia', value: 'Georgia, serif' },
{ label: 'Arial', value: 'Arial, sans-serif' },
{ label: 'Tahoma', value: 'Tahoma, sans-serif' },
]

const FONT_SIZES = ['14px', '16px', '18px', '20px', '24px', '32px']
const LINE_HEIGHTS = ['1.2', '1.4', '1.6', '1.8', '2']
const TEXT_COLORS = ['#F5F5F5', '#F87171', '#FB923C', '#4ADE80', '#60A5FA', '#A78BFA', '#F472B6']
const HIGHLIGHT_COLORS = ['#A3E635', '#FBBF24', '#4ADE80', '#60A5FA', '#F472B6']

// Constante module-level : jamais recréée au rendu, ne capture aucune ref/closure.
// Le clic dispatche vers handleFabAction, qui lui exécute les actions réelles.
const FAB_ACTIONS = [
  { key: 'image', icon: ImageIcon, label: 'Image' },
  { key: 'video', icon: Video, label: 'Vidéo' },
  { key: 'link', icon: Link2, label: 'Lien' },
  { key: 'cta', icon: Sparkles, label: 'Bouton d’action' },
  { key: 'divider', icon: Minus, label: 'Séparateur' },
  { key: 'clear', icon: Eraser, label: 'Effacer la mise en forme' },
] as const

/**
 * Empêche le navigateur de retirer la sélection du contentEditable au mousedown,
 * ce qui se produit AVANT le onClick React. Sans ceci, un premier clic sur un
 * bouton toolbar (ex. Gras) applique la commande sur la bonne sélection, mais un
 * second clic agit sur une sélection déjà perdue/déplacée — le bouton semble ne
 * plus pouvoir "décocher". C'est le correctif standard documenté par Tiptap.
 */
const preserveSelection = (event: ReactMouseEvent) => event.preventDefault()

export function RichTextEditor({
  value,
  onChange,
  label = 'Contenu',
  placeholder = 'Décris ton produit : ce que ça contient, à qui ça s’adresse, pourquoi l’acheter…',
  characterLimit = 0,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const [openPanel, setOpenPanel] = useState<PanelId>(null)
  const [fabOpen, setFabOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'saved'>('idle')

  const [linkPanelOpen, setLinkPanelOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [videoPanelOpen, setVideoPanelOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [ctaPanelOpen, setCtaPanelOpen] = useState(false)
  const [ctaLabel, setCtaLabel] = useState('JE PROFITE')
  const [ctaHref, setCtaHref] = useState('')
  const [ctaBackground, setCtaBackground] = useState('#A3E635')
  const [ctaTextColor, setCtaTextColor] = useState('#0A0A0A')
  const [ctaRadius, setCtaRadius] = useState(9999)

  // Re-render forcé sur les changements de sélection : sans ça, les boutons
  // toolbar (isActive) et les panneaux couleur/police n'affichent jamais
  // l'état réel du curseur tant qu'on ne retape pas du texte.
  const [, forceUpdate] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noreferrer noopener', target: '_blank' },
      }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      TiptapVideo,
      CallToAction,
      TextStyle,
      TextStyleAttributes,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Typography,
      Placeholder.configure({ placeholder }),
      Focus.configure({ className: 'rte-focused', mode: 'shallowest' }),
      ...(characterLimit > 0 ? [CharacterCount.configure({ limit: characterLimit })] : [CharacterCount]),
    ],
    content: parseRichTextValue(value),
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
      setUploadStatus('saved')
    },
    onSelectionUpdate: () => forceUpdate((n) => n + 1),
    onTransaction: () => forceUpdate((n) => n + 1),
    editorProps: {
      attributes: {
        class:
          'rte-content prose prose-sm sm:prose-base max-w-none min-h-[280px] focus:outline-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-blockquote:border-l-primary/50 prose-blockquote:not-italic prose-img:rounded-2xl',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const parsed = parseRichTextValue(value)
    const current = JSON.stringify(editor.getJSON())
    const incoming = typeof parsed === 'string' ? parsed : JSON.stringify(parsed)
    if (current === incoming) return
    editor.commands.setContent(parsed, { emitUpdate: false })
  }, [editor, value])

  // Ferme les panneaux flottants au clic extérieur et à la touche Échap
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpenPanel(null)
        setFabOpen(false)
      }
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenPanel(null)
        setFabOpen(false)
        setLinkPanelOpen(false)
        setVideoPanelOpen(false)
        setCtaPanelOpen(false)
        if (isFullscreen) setIsFullscreen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isFullscreen])

  const closeAllPanels = useCallback(() => {
    setOpenPanel(null)
    setFabOpen(false)
    setLinkPanelOpen(false)
    setVideoPanelOpen(false)
    setCtaPanelOpen(false)
  }, [])

  const togglePanel = (panel: PanelId) => {
    setFabOpen(false)
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  const insertImage = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Le fichier doit être une image')
        return
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Fichier trop lourd — max 20MB')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'product-description-media')

      setUploadStatus('uploading')
      try {
        const response = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        })
        const result = await response.json()

        if (!response.ok || !result.url) {
          throw new Error(result?.error?.message || result?.error || 'Échec de l’upload')
        }

        editor?.chain().focus().setImage({ src: result.url, alt: file.name }).run()
        setUploadStatus('saved')
        toast.success('Image insérée')
      } catch (error) {
        console.error('Upload error:', error)
        setUploadStatus('idle')
        toast.error('Impossible d’insérer l’image')
      }
    },
    [editor]
  )

  const openImagePicker = () => {
    closeAllPanels()
    fileInputRef.current?.click()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingFile(false)
    const file = event.dataTransfer.files?.[0]
    if (file) insertImage(file)
  }

  const openLinkPanel = () => {
    closeAllPanels()
    setLinkUrl(editor?.getAttributes('link')?.href ?? '')
    setLinkPanelOpen(true)
  }

  const insertLink = () => {
    if (!editor) return
    const url = linkUrl.trim()
    if (!url) {
      toast.error('URL du lien requise')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run()
    setLinkPanelOpen(false)
    setLinkUrl('')
  }

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run()
    setLinkPanelOpen(false)
  }

  const openVideoPanel = () => {
    closeAllPanels()
    setVideoUrl('')
    setVideoPanelOpen(true)
  }

  const insertVideo = () => {
    if (!editor) return
    const src = videoUrl.trim()
    if (!src) {
      toast.error('URL vidéo requise')
      return
    }
    editor.chain().focus().insertContent({ type: 'video', attrs: { src, controls: true, width: '100%', height: 'auto' } }).run()
    setVideoPanelOpen(false)
    setVideoUrl('')
  }

  const openCtaPanel = () => {
    closeAllPanels()
    setCtaPanelOpen(true)
  }

  const insertCta = () => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'callToAction',
        attrs: {
          label: ctaLabel.trim() || 'JE PROFITE',
          href: ctaHref.trim() || '#',
          background: ctaBackground,
          textColor: ctaTextColor,
          borderRadius: `${ctaRadius}px`,
          align: 'center',
        },
      })
      .run()
    setCtaPanelOpen(false)
  }

  const isActive = useCallback(
    (name: string, options?: Record<string, unknown>) => Boolean(editor?.isActive(name, options)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- forceUpdate keeps this in sync with selection
    [editor, editor?.state.selection]
  )

  const charCount = editor?.storage.characterCount?.characters?.() ?? 0
  const nearLimit = characterLimit > 0 && charCount / characterLimit > 0.9
  const overLimit = characterLimit > 0 && charCount > characterLimit

  const buttonBase =
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed'
  const buttonState = (active: boolean) =>
    active
      ? 'border-primary/40 bg-primary/10 text-primary'
      : 'text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]'

  // Métadonnées pures (aucune closure, aucune ref) : le dispatch réel se fait
  // dans handleFabAction, appelé depuis le onClick du bouton — jamais pendant
  // le rendu. C'est ce qui évite toute capture de ref dans une valeur mémoïsée.
  const handleFabAction = (key: string) => {
    switch (key) {
      case 'image':
        openImagePicker()
        break
      case 'video':
        openVideoPanel()
        break
      case 'link':
        openLinkPanel()
        break
      case 'cta':
        openCtaPanel()
        break
      case 'divider':
        editor?.chain().focus().setHorizontalRule().run()
        setFabOpen(false)
        break
      case 'clear':
        editor?.chain().focus().unsetAllMarks().clearNodes().run()
        setFabOpen(false)
        break
    }
  }

  if (!editor) {
    return (
      <div className="flex min-h-[340px] items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={20} />
      </div>
    )
  }

  return (
    <div
      ref={wrapperRef}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[var(--background)] p-4 sm:p-8'
          : 'relative space-y-3'
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {uploadStatus !== 'idle' && (
              <motion.span
                key={uploadStatus}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Envoi en cours
                  </>
                ) : (
                  <>
                    <Check size={12} className="text-[var(--success)]" /> Enregistré
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
          <button
            type="button"
            onMouseDown={preserveSelection}
            onClick={() => setIsFullscreen((current) => !current)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] transition hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Barre d'outils contextuelle — reste toujours visible, sert à l'édition du texte sélectionné.
          z-30 : passe au-dessus de la zone d'édition et de son FAB. */}
      <div className="relative z-30 flex flex-wrap items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5">
        <div className="flex items-center gap-0.5 border-r border-[var(--border)] pr-1.5">
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(false)}`} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Annuler">
            <ArrowLeft size={15} />
          </button>
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(false)}`} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Rétablir">
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="flex items-center gap-0.5 border-r border-[var(--border)] pr-1.5">
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(isActive('bold'))}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras (Ctrl+B)">
            <Bold size={15} />
          </button>
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(isActive('italic'))}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique (Ctrl+I)">
            <Italic size={15} />
          </button>
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(isActive('underline'))}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Souligné (Ctrl+U)">
            <UnderlineIcon size={15} />
          </button>
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(isActive('strike'))}`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré">
            <Strikethrough size={15} />
          </button>
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(isActive('code'))}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Code">
            <Code2 size={15} />
          </button>
        </div>

        {/* Bloc : titres, paragraphe, listes, citation */}
        <div className="relative border-r border-[var(--border)] pr-1.5">
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(openPanel === 'block')} gap-1 !w-auto px-2`} onClick={() => togglePanel('block')} title="Type de bloc">
            <Type size={15} />
          </button>
          <AnimatePresence>
            {openPanel === 'block' && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                onMouseDown={preserveSelection}
                className="absolute left-0 top-full z-40 mt-2 grid w-56 grid-cols-2 gap-1 rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-2 shadow-2xl shadow-black/40"
              >
                <button type="button" className={`${buttonBase} ${buttonState(isActive('heading', { level: 1 }))} !w-full justify-start gap-2 px-2`} onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setOpenPanel(null) }}>
                  <Heading1 size={15} /> Titre 1
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('heading', { level: 2 }))} !w-full justify-start gap-2 px-2`} onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setOpenPanel(null) }}>
                  <Heading2 size={15} /> Titre 2
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('heading', { level: 3 }))} !w-full justify-start gap-2 px-2`} onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setOpenPanel(null) }}>
                  <Heading3 size={15} /> Titre 3
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('paragraph'))} !w-full justify-start gap-2 px-2`} onClick={() => { editor.chain().focus().setParagraph().run(); setOpenPanel(null) }}>
                  <Pilcrow size={15} /> Texte
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('bulletList'))} !w-full justify-start gap-2 px-2 col-span-1`} onClick={() => { editor.chain().focus().toggleBulletList().run(); setOpenPanel(null) }}>
                  <List size={15} /> Puces
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('orderedList'))} !w-full justify-start gap-2 px-2`} onClick={() => { editor.chain().focus().toggleOrderedList().run(); setOpenPanel(null) }}>
                  <ListOrdered size={15} /> Numéros
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('blockquote'))} !w-full justify-start gap-2 px-2 col-span-2`} onClick={() => { editor.chain().focus().toggleBlockquote().run(); setOpenPanel(null) }}>
                  <Quote size={15} /> Citation
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alignement */}
        <div className="relative border-r border-[var(--border)] pr-1.5">
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(openPanel === 'align')}`} onClick={() => togglePanel('align')} title="Alignement">
            <AlignLeft size={15} />
          </button>
          <AnimatePresence>
            {openPanel === 'align' && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                onMouseDown={preserveSelection}
                className="absolute left-0 top-full z-40 mt-2 flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-1.5 shadow-2xl shadow-black/40"
              >
                <button type="button" className={`${buttonBase} ${buttonState(isActive('textAlign', { align: 'left' }))}`} onClick={() => { editor.chain().focus().setTextAlign('left').run(); setOpenPanel(null) }}>
                  <AlignLeft size={15} />
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('textAlign', { align: 'center' }))}`} onClick={() => { editor.chain().focus().setTextAlign('center').run(); setOpenPanel(null) }}>
                  <AlignCenter size={15} />
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('textAlign', { align: 'right' }))}`} onClick={() => { editor.chain().focus().setTextAlign('right').run(); setOpenPanel(null) }}>
                  <AlignRight size={15} />
                </button>
                <button type="button" className={`${buttonBase} ${buttonState(isActive('textAlign', { align: 'justify' }))}`} onClick={() => { editor.chain().focus().setTextAlign('justify').run(); setOpenPanel(null) }}>
                  <AlignJustify size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Couleur & apparence */}
        <div className="relative">
          <button type="button" onMouseDown={preserveSelection} className={`${buttonBase} ${buttonState(openPanel === 'color')}`} onClick={() => togglePanel('color')} title="Couleur et style">
            <Palette size={15} />
          </button>
          <AnimatePresence>
            {openPanel === 'color' && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                onMouseDown={preserveSelection}
                className="absolute left-0 top-full z-40 mt-2 w-72 space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-3 shadow-2xl shadow-black/40"
              >
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Couleur du texte</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-6 w-6 rounded-full border border-white/10 transition hover:ring-2 hover:ring-[var(--ring)]"
                        style={{ backgroundColor: color }}
                        onClick={() => editor.chain().focus().setColor(color).run()}
                        title={color}
                      />
                    ))}
                    <button type="button" className={`${buttonBase} ${buttonState(false)} !h-6 !w-6`} onClick={() => editor.chain().focus().unsetColor().run()} title="Réinitialiser la couleur">
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Surlignage</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-6 w-6 rounded-full border border-white/10 transition hover:ring-2 hover:ring-[var(--ring)]"
                        style={{ backgroundColor: color }}
                        onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                        title={color}
                      />
                    ))}
                    <button type="button" className={`${buttonBase} ${buttonState(false)} !h-6 !w-6`} onClick={() => editor.chain().focus().unsetHighlight().run()} title="Retirer le surlignage">
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Police</span>
                    <Select
                      value={(editor.getAttributes('textStyle').fontFamily as string | undefined) || 'default'}
                      onValueChange={(font) => {
                        if (font && font !== 'default') editor.chain().focus().setFontFamily(font).run()
                        else editor.chain().focus().unsetFontFamily().run()
                      }}
                    >
                      <SelectTrigger className="h-8 w-full text-xs" size="sm">
                        <SelectValue placeholder="Police" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map((font) => (
                          <SelectItem key={font.label} value={font.value || 'default'}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Taille</span>
                    <Select
                      value={(editor.getAttributes('textStyle').fontSize as string | undefined) || 'default'}
                      onValueChange={(size) => {
                        if (size && size !== 'default') editor.chain().focus().setFontSize(size).run()
                        else editor.chain().focus().unsetFontSize().run()
                      }}
                    >
                      <SelectTrigger className="h-8 w-full text-xs" size="sm">
                        <SelectValue placeholder="Taille" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Défaut</SelectItem>
                        {FONT_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.replace('px', '')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="col-span-2 block">
                    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Interligne</span>
                    <Select
                      value={(editor.getAttributes('textStyle').lineHeight as string | undefined) || 'default'}
                      onValueChange={(lh) => {
                        if (lh && lh !== 'default') editor.chain().focus().setLineHeight(lh).run()
                        else editor.chain().focus().unsetLineHeight().run()
                      }}
                    >
                      <SelectTrigger className="h-8 w-full text-xs" size="sm">
                        <SelectValue placeholder="Interligne" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Défaut</SelectItem>
                        {LINE_HEIGHTS.map((lh) => (
                          <SelectItem key={lh} value={lh}>
                            {lh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Zone d'édition — pas d'overflow-hidden : le FAB et ses panneaux ont besoin de
          déborder visuellement. Le débordement du texte lui-même est déjà contenu par
          prose + max-w-none, donc rien d'utile n'était gagné par overflow-hidden ici. */}
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingFile(true)
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={handleDrop}
        className={`relative z-0 rounded-3xl border bg-[var(--surface)] p-5 shadow-sm transition-colors ${
          isDraggingFile ? 'border-primary/60 bg-primary/5' : 'border-[var(--border)]'
        } ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}
      >
        <EditorContent editor={editor} />

        {isDraggingFile && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-3xl border-2 border-dashed border-primary/60 bg-[var(--surface)]/95">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <ImageIcon size={16} /> Dépose ton image ici
            </p>
          </div>
        )}
      </div>

      {/* FAB — menu vertical ancré au-dessus du bouton, jamais de débordement possible :
          chaque item est empilé (flex-col) au lieu d'un arc de cercle qui pouvait sortir
          du cadre selon le nombre d'actions et la taille d'écran. */}
      <div className="pointer-events-none sticky bottom-4 z-30 flex justify-end pr-1">
        <div className="pointer-events-auto relative">
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.16 }}
                className="absolute bottom-full right-0 mb-3 flex flex-col gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-1.5 shadow-2xl shadow-black/40"
              >
                {FAB_ACTIONS.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.key}
                      type="button"
                      onClick={() => handleFabAction(action.key)}
                      title={action.label}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] hover:text-primary"
                    >
                      <Icon size={16} className="shrink-0 text-[var(--muted-foreground)]" />
                      {action.label}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setFabOpen((current) => !current)}
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-[var(--primary-foreground)] shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
            title="Insérer un élément"
          >
            <Plus size={20} />
          </motion.button>
        </div>
      </div>

      {/* Pied de zone : compteur de caractères + aide contextuelle */}
      <div className="flex items-center justify-between px-1 text-xs text-[var(--muted-foreground)]">
        <p>Structure ta fiche avec des titres, listes et un bouton d’action pour donner envie d’acheter.</p>
        {characterLimit > 0 && (
          <span className={overLimit ? 'font-medium text-[var(--destructive)]' : nearLimit ? 'font-medium text-[var(--warning)]' : ''}>
            {charCount}/{characterLimit}
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0]
          if (!file) return
          insertImage(file)
          event.target.value = ''
        }}
      />

      {/* Panneaux modaux légers : lien / vidéo / CTA — z-40, au-dessus de tout le reste */}
      <AnimatePresence>
        {linkPanelOpen && (
          <FloatingCard title="Ajouter un lien" onClose={() => setLinkPanelOpen(false)}>
            <input
              type="url"
              autoFocus
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && insertLink()}
              placeholder="https://campus-market.com/produit/..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
            />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={insertLink} className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90">
                Insérer
              </button>
              {isActive('link') && (
                <button type="button" onClick={removeLink} className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--surface-2)]">
                  Retirer
                </button>
              )}
            </div>
          </FloatingCard>
        )}

        {videoPanelOpen && (
          <FloatingCard title="Insérer une vidéo" onClose={() => setVideoPanelOpen(false)}>
            <input
              type="url"
              autoFocus
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && insertVideo()}
              placeholder="https://... (mp4 direct)"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
            />
            <button type="button" onClick={insertVideo} className="mt-3 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90">
              Insérer
            </button>
          </FloatingCard>
        )}

        {ctaPanelOpen && (
          <FloatingCard title="Bouton d'action" onClose={() => setCtaPanelOpen(false)} wide>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={ctaLabel}
                onChange={(event) => setCtaLabel(event.target.value)}
                placeholder="Texte du bouton"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
              />
              <input
                type="url"
                value={ctaHref}
                onChange={(event) => setCtaHref(event.target.value)}
                placeholder="Lien de destination"
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-primary/50"
              />
            </div>
            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                Fond
                <input type="color" value={ctaBackground} onChange={(event) => setCtaBackground(event.target.value)} className="h-7 w-9 cursor-pointer rounded-md border border-[var(--border)] p-0" />
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                Texte
                <input type="color" value={ctaTextColor} onChange={(event) => setCtaTextColor(event.target.value)} className="h-7 w-9 cursor-pointer rounded-md border border-[var(--border)] p-0" />
              </label>
              <label className="flex flex-1 items-center gap-2 text-xs text-[var(--muted-foreground)]">
                Arrondi
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={2}
                  value={ctaRadius > 32 ? 32 : ctaRadius}
                  onChange={(event) => setCtaRadius(Number(event.target.value))}
                  className="flex-1 accent-primary"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <span
                style={{
                  background: ctaBackground,
                  color: ctaTextColor,
                  borderRadius: `${ctaRadius}px`,
                }}
                className="inline-flex items-center px-5 py-2.5 text-sm font-bold"
              >
                {ctaLabel || 'JE PROFITE'}
              </span>
            </div>
            <button type="button" onClick={insertCta} className="mt-4 w-full rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90">
              Insérer le bouton
            </button>
          </FloatingCard>
        )}
      </AnimatePresence>
    </div>
  )
}

function FloatingCard({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`relative z-40 rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-4 shadow-2xl shadow-black/40 ${wide ? 'max-w-md' : 'max-w-sm'}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
        <button type="button" onClick={onClose} className="text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
          <X size={16} />
        </button>
      </div>
      {children}
    </motion.div>
  )
}
