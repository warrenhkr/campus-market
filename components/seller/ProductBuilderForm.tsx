'use client'

import { useRef, useState, useEffect, useTransition, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ImageUpload'
import { RichTextEditor } from '@/components/RichTextEditor'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import { SortableList } from '@/components/SortableList'
import { toast } from 'sonner'
import { MoreVertical, Pencil, Trash2, Download, X, LayoutGrid, List as ListIcon, ChevronDown } from 'lucide-react'

interface Category {
  id: string
  name: string
}

type SalesPageSectionType = 'hero' | 'text' | 'feature_list' | 'faq' | 'cta'

interface HeroSectionContent {
  headline: string
  subheadline: string
  imageUrl: string | null
  ctaText: string
  ctaUrl: string
}

interface TextSectionContent {
  title: string
  body: string
}

interface FeatureItem {
  title: string
  description: string
}

interface FeatureListSectionContent {
  title: string
  items: FeatureItem[]
}

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionContent {
  title: string
  items: FAQItem[]
}

interface CTASectionContent {
  headline: string
  buttonText: string
  buttonUrl: string
}

type SalesPageSectionContent =
  | HeroSectionContent
  | TextSectionContent
  | FeatureListSectionContent
  | FAQSectionContent
  | CTASectionContent

interface BaseSalesPageSection {
  id: string
  position: number
  isVisible: boolean
  styles?: Record<string, string>
}

interface HeroSection extends BaseSalesPageSection {
  type: 'hero'
  content: HeroSectionContent
}

interface TextSection extends BaseSalesPageSection {
  type: 'text'
  content: TextSectionContent
}

interface FeatureListSection extends BaseSalesPageSection {
  type: 'feature_list'
  content: FeatureListSectionContent
}

interface FAQSection extends BaseSalesPageSection {
  type: 'faq'
  content: FAQSectionContent
}

interface CTASection extends BaseSalesPageSection {
  type: 'cta'
  content: CTASectionContent
}

type SalesPageSection = HeroSection | TextSection | FeatureListSection | FAQSection | CTASection

export type AvailabilityScope = 'MON_UNIVERSITE' | 'AUTRES_UNIVERSITES' | 'HORS_UNIVERSITE' | 'PARTOUT'

interface DeliveryZone {
  id: string
  name: string
  fee: string
  estimatedMinDays: string
  estimatedMaxDays: string
  isActive: boolean
}

export interface ProductBuilderInitialData {
  id?: string
  name?: string
  slug?: string | null
  description?: string
  price?: number | string
  original_price?: number | string | null
  stock?: number | string
  stock_mode?: 'UNLIMITED' | 'TRACKED' | 'PREORDER' | 'OUT_OF_STOCK'
  low_stock_threshold?: number | string | null
  allow_backorder?: boolean
  category_id?: string | null
  type?: 'PHYSICAL' | 'DIGITAL'
  image_url?: string | null
  promo_label?: string | null
  promo_start_at?: string | null
  promo_end_at?: string | null
  promo_auto_renew?: boolean
  cta_text?: string | null
  cta_url?: string | null
  cta_style?: 'PRIMARY' | 'SECONDARY' | 'primary' | 'secondary'
  is_available?: boolean
  is_hidden_from_shop?: boolean
  hide_sales_count?: boolean
  sales_limit?: number | string | null
  restock_threshold?: number | string | null
  restock_quantity?: number | string | null
  post_purchase_instructions?: string | null
  require_shipping_address?: boolean
  file_password?: string | null
  watermark_files?: boolean
  seo_title?: string | null
  seo_description?: string | null
  seo_thumbnail_url?: string | null
  seo_keywords?: string | null
  variants?: Array<{ id?: string; name?: string | null; price_delta?: number | string | null; stock_delta?: number | string | null }> | null
  delivery_zones?: Array<{ id?: string; name?: string | null; fee?: number | string | null; estimated_min_days?: number | string | null; estimated_max_days?: number | string | null; is_active?: boolean } | null> | null
  faqs?: Array<{ id?: string; question?: string | null; answer?: string | null; is_published?: boolean; layout?: 'ACCORDION' | 'GRID' | 'LIST' } | null> | null
  pricing_tiers?: Array<{ id?: string; label?: string | null; price?: number | string | null; is_default?: boolean } | null> | null
  shop?: { slug?: string | null } | null
  metadata?: {
    slug?: string | null
    autoDiscount?: { enabled?: boolean; type?: 'FIXED' | 'PERCENT'; value?: number | string | null } | null
    seo?: {
      metaTitle?: string | null
      metaDescription?: string | null
      ogTitle?: string | null
      ogDescription?: string | null
      ogImage?: string | null
    }
    visibility?: {
      showStock?: boolean
      showRelatedProducts?: boolean
    }
    gallery?: Array<string | null> | null
    /** @deprecated les variantes viennent désormais de `variants` (table relationnelle) — conservé pour lire d'anciens produits pas encore migrés */
    variants?: Array<{ name?: string | null; priceDelta?: number | string | null; stockDelta?: number | string | null }> | null
    availability?: { scope?: AvailabilityScope; note?: string | null } | null
    /** @deprecated remplacé par `stock_mode` de premier niveau */
    stockMode?: 'UNLIMITED' | 'TRACKED' | 'PREORDER' | 'OUT_OF_STOCK'
    /** @deprecated remplacé par `low_stock_threshold` de premier niveau */
    lowStockThreshold?: number | string | null
    /** @deprecated remplacé par `allow_backorder` de premier niveau */
    allowBackorder?: boolean
    pickup?: { available?: boolean; location?: string | null } | null
    /** @deprecated `delivery.zones` vient désormais de `delivery_zones` (table relationnelle) — conservé pour lire d'anciens produits pas encore migrés */
    delivery?: { enabled?: boolean; fee?: number | string | null; freeThreshold?: number | string | null; zones?: Array<{ id?: string; name?: string | null; fee?: number | string | null; estimatedMinDays?: number | string | null; estimatedMaxDays?: number | string | null; isActive?: boolean } | null> | null } | null
    salesPage?: {
      ctaColor?: string | null
      hero?: {
        headline?: string | null
        subheadline?: string | null
        imageUrl?: string | null
        ctaText?: string | null
        ctaUrl?: string | null
      } | null
      body?: string | null
      sections?: Array<{ id?: string; type?: SalesPageSectionType; position?: number; isVisible?: boolean; content?: SalesPageSectionContent; styles?: Record<string, string> }> | null
    } | null
  }
}

interface ProductBuilderFormProps {
  categories: Category[]
  apiEndpoint: string
  method: 'POST' | 'PATCH'
  submitLabel: string
  initialData?: ProductBuilderInitialData
  /** Slug de la boutique du vendeur, pour afficher l'aperçu de l'URL publique du produit */
  shopSlug?: string
  onSuccess?: () => void
}

const builderTabs = [
  { key: 'information', label: 'Informations', description: 'Renseigne le nom, la description, le type et la catégorie du produit.' },
  { key: 'medias', label: 'Médias', description: 'Ajoute les images principales et la galerie produit pour donner envie.' },
  { key: 'prix', label: 'Prix', description: 'Définis le prix, la promotion, le CTA et les incitations à l’achat.' },
  { key: 'stock', label: 'Stock', description: 'Gère la disponibilité, le stock, les variantes, la livraison et le pickup.' },
  { key: 'page-de-vente', label: 'Page de vente', description: 'Rédige une page commerciale avec un hero et un contenu riche en direct.' },
  { key: 'faq', label: 'Questions fréquentes', description: 'Réponds aux questions les plus posées sur ce produit.' },
  { key: 'seo', label: 'SEO', description: 'Optimise le référencement et l’aperçu de partage de la fiche produit.' },
  { key: 'marketing', label: 'Marketing', description: 'Outils promotionnels pour ce produit.' },
]

const AVAILABILITY_SCOPE_OPTIONS: Array<{ value: AvailabilityScope; label: string; description: string }> = [
  { value: 'PARTOUT', label: 'Partout', description: 'Visible pour tous les étudiants, toutes universités confondues.' },
  { value: 'MON_UNIVERSITE', label: 'Mon université', description: 'Réservé aux étudiants de ta propre université.' },
  { value: 'AUTRES_UNIVERSITES', label: 'Autres universités', description: 'Visible uniquement pour les étudiants d’autres universités.' },
  { value: 'HORS_UNIVERSITE', label: 'Hors université', description: 'Visible pour les acheteurs hors du cadre universitaire.' },
]

const STOCK_MODE_OPTIONS: Array<{ value: 'UNLIMITED' | 'TRACKED' | 'PREORDER' | 'OUT_OF_STOCK'; label: string; description: string }> = [
  { value: 'TRACKED', label: 'Suivi', description: 'Le stock affiché est décrémenté à chaque commande.' },
  { value: 'UNLIMITED', label: 'Illimité', description: 'Pas de suivi de quantité — toujours disponible à la commande.' },
  { value: 'PREORDER', label: 'Précommande', description: 'Le produit se commande avant d’être disponible.' },
  { value: 'OUT_OF_STOCK', label: 'Rupture', description: 'Le produit n’est temporairement plus commandable.' },
]

export function ProductBuilderForm({
  categories,
  apiEndpoint,
  method,
  submitLabel,
  initialData,
  shopSlug = '',
  onSuccess,
}: ProductBuilderFormProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedTab, setSelectedTab] = useState<string>('information')

  const initialState = initialData ?? {}
  const initialProductId = initialState.id
  const initialMetadata = initialState.metadata ?? {}

  const [name, setName] = useState(initialState.name ?? '')
  const [description, setDescription] = useState(initialState.description ?? '')
  const [price, setPrice] = useState(initialState.price ? String(initialState.price) : '')
  const [originalPrice, setOriginalPrice] = useState(initialState.original_price ? String(initialState.original_price) : '')
  const [stock, setStock] = useState(initialState.stock ? String(initialState.stock) : '0')
  const [categoryId, setCategoryId] = useState(initialState.category_id ?? '')
  const [productType, setProductType] = useState<'PHYSICAL' | 'DIGITAL'>(initialState.type ?? 'PHYSICAL')
  const [imageUrl, setImageUrl] = useState<string | null>(initialState.image_url ?? null)
  const [promoLabel, setPromoLabel] = useState(initialState.promo_label ?? '')
  const [promoEndAt, setPromoEndAt] = useState(initialState.promo_end_at ? new Date(initialState.promo_end_at).toISOString().slice(0, 16) : '')
  const [ctaText, setCtaText] = useState(initialState.cta_text ?? '')
  const [ctaUrl, setCtaUrl] = useState(initialState.cta_url ?? '')
  const [ctaStyle, setCtaStyle] = useState<'primary' | 'secondary'>((initialState.cta_style ?? 'PRIMARY').toLowerCase() as 'primary' | 'secondary')
  const [isAvailable, setIsAvailable] = useState(initialState.is_available ?? true)

  const [ogTitle, setOgTitle] = useState(initialMetadata.seo?.ogTitle ?? '')
  const [ogDescription, setOgDescription] = useState(initialMetadata.seo?.ogDescription ?? '')
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(initialMetadata.seo?.ogImage ?? null)
  const [showStock, setShowStock] = useState(initialMetadata.visibility?.showStock ?? true)
  const [pageHeroHeadline, setPageHeroHeadline] = useState(initialMetadata.salesPage?.hero?.headline ?? '')
  const [pageHeroSubheadline, setPageHeroSubheadline] = useState(initialMetadata.salesPage?.hero?.subheadline ?? '')
  const [pageHeroImageUrl, setPageHeroImageUrl] = useState<string | null>(initialMetadata.salesPage?.hero?.imageUrl ?? null)
  const [pageHeroCtaText, setPageHeroCtaText] = useState(initialMetadata.salesPage?.hero?.ctaText ?? '')
  const [pageHeroCtaUrl, setPageHeroCtaUrl] = useState(initialMetadata.salesPage?.hero?.ctaUrl ?? '')
  const [pageHeroCtaColor, setPageHeroCtaColor] = useState(initialMetadata.salesPage?.ctaColor ?? '')
  const [pageContent, setPageContent] = useState(initialMetadata.salesPage?.body ?? '')

  // Resync image/cta color when initialData changes (useful on edit page when initialData is loaded async)
  useEffect(() => {
    // Fallback order for product cover image:
    // 1) product.image_url (first-class column)
    // 2) metadata.gallery[0] (legacy stored gallery)
    const fallbackImage = initialState.image_url ?? (Array.isArray(initialMetadata.gallery) && initialMetadata.gallery.length > 0 ? initialMetadata.gallery[0] : null) ?? null
    setImageUrl(fallbackImage)
    setPageHeroImageUrl(initialMetadata.salesPage?.hero?.imageUrl ?? null)
    setSeoThumbnailUrl(initialState.seo_thumbnail_url ?? initialMetadata.seo?.ogImage ?? '')
    setOgImageUrl(initialMetadata.seo?.ogImage ?? null)
    setPageHeroCtaColor(initialMetadata.salesPage?.ctaColor ?? '')
  }, [initialData])
  const initialSalesPageSections = Array.isArray(initialMetadata.salesPage?.sections)
    ? (initialMetadata.salesPage.sections as SalesPageSection[])
    : []
  const [salesPageSections, setSalesPageSections] = useState<SalesPageSection[]>(initialSalesPageSections)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpPosition, setHelpPosition] = useState({ right: 24, bottom: 120 })
  const dragState = useRef<{ startX: number; startY: number; originRight: number; originBottom: number } | null>(null)

  const handleHelpPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originRight: helpPosition.right,
      originBottom: helpPosition.bottom,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleHelpPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return
    const deltaX = event.clientX - dragState.current.startX
    const deltaY = event.clientY - dragState.current.startY
    setHelpPosition({
      right: Math.max(12, dragState.current.originRight - deltaX),
      bottom: Math.max(12, dragState.current.originBottom - deltaY),
    })
  }

  const handleHelpPointerUp = () => {
    dragState.current = null
  }

  const makeSectionId = () => `section-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  const normalizeSections = (sections: SalesPageSection[]) =>
    sections.map((section, index) => ({ ...section, position: index }))

  const createEmptySection = (type: SalesPageSectionType): SalesPageSection => {
    const id = makeSectionId()
    const position = salesPageSections.length
    const base = {
      id,
      position,
      isVisible: true,
      styles: {},
    }

    switch (type) {
      case 'hero':
        return {
          ...base,
          type: 'hero',
          content: {
            headline: '',
            subheadline: '',
            imageUrl: null,
            ctaText: '',
            ctaUrl: '',
          },
        }
      case 'text':
        return {
          ...base,
          type: 'text',
          content: { title: '', body: '' },
        }
      case 'feature_list':
        return {
          ...base,
          type: 'feature_list',
          content: { title: '', items: [] },
        }
      case 'faq':
        return {
          ...base,
          type: 'faq',
          content: { title: '', items: [] },
        }
      case 'cta':
        return {
          ...base,
          type: 'cta',
          content: { headline: '', buttonText: '', buttonUrl: '' },
        }
    }
  }

  const addSection = (type: SalesPageSectionType) => {
    setSalesPageSections((current) => normalizeSections([...current, createEmptySection(type)]))
  }

  const updateSection = (index: number, updates: Partial<Omit<SalesPageSection, 'type' | 'content'>>) => {
    setSalesPageSections((current) =>
      normalizeSections(
        current.map((section, i) => (i === index ? { ...section, ...updates } : section))
      )
    )
  }

  const updateSectionContent = (index: number, updates: Partial<SalesPageSectionContent>) => {
    setSalesPageSections((current) =>
      normalizeSections(
        current.map((section, i) =>
          i === index
            ? ({
                ...section,
                content: { ...section.content, ...updates },
              } as SalesPageSection)
            : section
        )
      )
    )
  }

  const updateSectionItem = (
    index: number,
    itemIndex: number,
    field: string,
    value: string
  ) => {
    setSalesPageSections((current) =>
      normalizeSections(
        current.map((section, i) => {
          if (i !== index) return section
          if (section.type === 'feature_list') {
            const items = [...(section.content.items ?? [])]
            items[itemIndex] = { ...items[itemIndex], [field]: value }
            return { ...section, content: { ...section.content, items } }
          }
          if (section.type === 'faq') {
            const items = [...(section.content.items ?? [])]
            items[itemIndex] = { ...items[itemIndex], [field]: value }
            return { ...section, content: { ...section.content, items } }
          }
          return section
        })
      )
    )
  }

  const addSectionItem = (index: number) => {
    setSalesPageSections((current) =>
      normalizeSections(
        current.map((section, i) => {
          if (i !== index) return section
          if (section.type === 'feature_list') {
            const items = [...(section.content.items ?? []), { title: '', description: '' }]
            return { ...section, content: { ...section.content, items } }
          }
          if (section.type === 'faq') {
            const items = [...(section.content.items ?? []), { question: '', answer: '' }]
            return { ...section, content: { ...section.content, items } }
          }
          return section
        })
      )
    )
  }

  const removeSectionItem = (index: number, itemIndex: number) => {
    setSalesPageSections((current) =>
      normalizeSections(
        current.map((section, i) => {
          if (i !== index) return section
          if (section.type === 'feature_list') {
            const items = (section.content.items ?? []).filter((_, j) => j !== itemIndex)
            return { ...section, content: { ...section.content, items } }
          }
          if (section.type === 'faq') {
            const items = (section.content.items ?? []).filter((_, j) => j !== itemIndex)
            return { ...section, content: { ...section.content, items } }
          }
          return section
        })
      )
    )
  }

  const moveSection = (index: number, direction: -1 | 1) => {
    setSalesPageSections((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return next
      const temp = next[index]
      next[index] = next[target]
      next[target] = temp
      return normalizeSections(next)
    })
  }

  const removeSection = (index: number) => {
    setSalesPageSections((current) => normalizeSections(current.filter((_, i) => i !== index)))
  }

  const renderSectionPreview = (section: SalesPageSection) => {
    if (!section.isVisible) return null

    switch (section.type) {
      case 'text': {
        const hasTitle = !!section.content.title?.trim()
        const hasBody = !!section.content.body?.trim()
        if (!hasTitle && !hasBody) return null
        return (
          <div key={section.id} className="rounded-3xl border border-border bg-[var(--surface)] p-5">
            {hasTitle ? <h3 className="text-xl font-semibold text-foreground">{section.content.title}</h3> : null}
            {hasBody ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.content.body}</p> : null}
          </div>
        )
      }
      case 'feature_list': {
        const hasTitle = !!section.content.title?.trim()
        const items = Array.isArray(section.content.items) ? section.content.items.filter((i) => !!(i.title?.trim() || i.description?.trim())) : []
        if (!hasTitle && items.length === 0) return null
        return (
          <div key={section.id} className="rounded-3xl border border-border bg-[var(--surface)] p-5">
            {hasTitle ? <h3 className="text-xl font-semibold text-foreground">{section.content.title}</h3> : null}
            {items.length > 0 ? (
              <div className="mt-4 space-y-3">
                {items.map((item, itemIndex) => (
                  <div key={itemIndex} className="rounded-2xl border border-border bg-[var(--surface)] p-4 shadow-sm">
                    {item.title ? <p className="text-sm font-semibold text-foreground">{item.title}</p> : null}
                    {item.description ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )
      }
      case 'faq': {
        const hasTitle = !!section.content.title?.trim()
        const items = Array.isArray(section.content.items) ? section.content.items.filter((i) => !!(i.question?.trim() || i.answer?.trim())) : []
        if (!hasTitle && items.length === 0) return null
        return (
          <div key={section.id} className="rounded-3xl border border-border bg-[var(--surface)] p-5">
            {hasTitle ? <h3 className="text-xl font-semibold text-foreground">{section.content.title}</h3> : null}
            {items.length > 0 ? (
              <div className="mt-4 space-y-4">
                {items.map((item, itemIndex) => (
                  <div key={itemIndex} className="rounded-2xl border border-border bg-[var(--surface)] p-4">
                    {item.question ? <p className="text-sm font-semibold text-foreground">{item.question}</p> : null}
                    {item.answer ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.answer}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )
      }
      case 'cta': {
        const hasHeadline = !!section.content.headline?.trim()
        const hasButton = !!section.content.buttonText?.trim()
        if (!hasHeadline && !hasButton) return null
        return (
          <div key={section.id} className="rounded-3xl border border-border bg-[var(--surface)] p-6 text-center">
            {hasHeadline ? <p className="text-xl font-semibold text-foreground">{section.content.headline}</p> : null}
            {hasButton ? (
              <a href={section.content.buttonUrl || '#'} className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                {section.content.buttonText}
              </a>
            ) : null}
          </div>
        )
      }
      case 'hero': {
        const hasHeadline = !!section.content.headline?.trim()
        const hasSub = !!section.content.subheadline?.trim()
        const heroImageUrl = section.content.imageUrl ?? null
        const hasImage = !!heroImageUrl
        if (!hasHeadline && !hasSub && !hasImage) return null
        return (
          <div key={section.id} className="rounded-3xl border border-border bg-[var(--surface)] p-6">
            {heroImageUrl ? (
              <div className="relative h-64 overflow-hidden rounded-3xl mb-6">
                <Image src={heroImageUrl} alt={section.content.headline || 'Hero'} fill className="object-cover" />
              </div>
            ) : null}
            {hasHeadline ? <h3 className="text-3xl font-extrabold text-foreground">{section.content.headline}</h3> : null}
            {hasSub ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.content.subheadline}</p> : null}
            {section.content.ctaText && section.content.ctaUrl ? (
              <a href={section.content.ctaUrl} className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
                {section.content.ctaText}
              </a>
            ) : null}
          </div>
        )
      }
      default:
        return null
    }
  }

  const [showRelatedProducts, setShowRelatedProducts] = useState(initialMetadata.visibility?.showRelatedProducts ?? true)
  const [slug, setSlug] = useState(initialState.slug ?? initialMetadata.slug ?? '')

  // Réduction automatique lors des relances panier abandonné (3e rappel)
  const [autoDiscountEnabled, setAutoDiscountEnabled] = useState(
    initialMetadata.autoDiscount?.enabled ?? false
  )
  const [autoDiscountType, setAutoDiscountType] = useState<'FIXED' | 'PERCENT'>(
    initialMetadata.autoDiscount?.type ?? 'FIXED'
  )
  const [autoDiscountValue, setAutoDiscountValue] = useState(
    initialMetadata.autoDiscount?.value != null ? String(initialMetadata.autoDiscount.value) : ''
  )

  // Post-achat & protection (produits numériques)
  const [postPurchaseInstructions, setPostPurchaseInstructions] = useState(initialState.post_purchase_instructions ?? '')
  const [requireShippingAddress, setRequireShippingAddress] = useState(initialState.require_shipping_address ?? false)
  const [filePassword, setFilePassword] = useState(initialState.file_password ?? '')
  const [watermarkFiles, setWatermarkFiles] = useState(initialState.watermark_files ?? false)

  // Exclusivité et visibilité
  const [isHiddenFromShop, setIsHiddenFromShop] = useState(initialState.is_hidden_from_shop ?? false)
  const [hideSalesCount, setHideSalesCount] = useState(initialState.hide_sales_count ?? false)
  const [salesLimit, setSalesLimit] = useState(initialState.sales_limit != null ? String(initialState.sales_limit) : '')

  // Réapprovisionnement automatique
  const [restockThreshold, setRestockThreshold] = useState(initialState.restock_threshold != null ? String(initialState.restock_threshold) : '')
  const [restockQuantity, setRestockQuantity] = useState(initialState.restock_quantity != null ? String(initialState.restock_quantity) : '')

  // Promo : période complète + renouvellement auto
  const [promoStartAt, setPromoStartAt] = useState(
    initialState.promo_start_at ? new Date(initialState.promo_start_at).toISOString().slice(0, 16) : ''
  )
  const [promoAutoRenew, setPromoAutoRenew] = useState(initialState.promo_auto_renew ?? false)

  // SEO dédié à la fiche produit
  const [seoProductTitle, setSeoProductTitle] = useState(initialState.seo_title ?? initialMetadata.seo?.metaTitle ?? '')
  const [seoProductDescription, setSeoProductDescription] = useState(initialState.seo_description ?? initialMetadata.seo?.metaDescription ?? '')
  const [seoThumbnailUrl, setSeoThumbnailUrl] = useState(initialState.seo_thumbnail_url ?? '')
  const [seoKeywords, setSeoKeywords] = useState(initialState.seo_keywords ?? '')

  // Tarifs alternatifs
  const [pricingTiers, setPricingTiers] = useState<Array<{ id?: string; label: string; price: string; isDefault: boolean }>>(
    Array.isArray(initialState.pricing_tiers)
      ? initialState.pricing_tiers
          .filter((tier): tier is NonNullable<typeof tier> => !!tier)
          .map((tier) => ({
            id: tier.id,
            label: tier.label ?? '',
            price: tier.price != null ? String(tier.price) : '',
            isDefault: tier.is_default ?? false,
          }))
      : []
  )

  const addPricingTier = () => {
    setPricingTiers((current) => [...current, { label: '', price: '', isDefault: current.length === 0 }])
  }
  const updatePricingTier = (index: number, updates: Partial<{ label: string; price: string; isDefault: boolean }>) => {
    setPricingTiers((current) =>
      current.map((tier, i) => {
        if (i !== index) {
          // Un seul tarif par défaut : désactive les autres si celui-ci devient le défaut
          return updates.isDefault ? { ...tier, isDefault: false } : tier
        }
        return { ...tier, ...updates }
      })
    )
  }
  const removePricingTier = (index: number) => {
    setPricingTiers((current) => current.filter((_, i) => i !== index))
  }

  // FAQ produit — question/réponse (éditeur riche), statut publié, layout,
  // réordonnable par glisser-déposer (id stable requis par SortableList).
  const [faqItems, setFaqItems] = useState<Array<{ id: string; question: string; answer: string; isPublished: boolean; layout: 'ACCORDION' | 'GRID' | 'LIST' }>>(
    Array.isArray(initialState.faqs) && initialState.faqs.length > 0
      ? initialState.faqs
          .filter((faq): faq is NonNullable<typeof faq> => !!faq)
          .map((faq, index) => ({
            id: faq.id ?? `faq-initial-${index}`,
            question: faq.question ?? '',
            answer: faq.answer ?? '',
            isPublished: faq.is_published ?? true,
            layout: faq.layout ?? 'ACCORDION',
          }))
      : []
  )
  const [faqFormOpen, setFaqFormOpen] = useState(false)
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [faqDraftQuestion, setFaqDraftQuestion] = useState('')
  const [faqDraftAnswer, setFaqDraftAnswer] = useState('')
  const [faqDraftLayout, setFaqDraftLayout] = useState<'ACCORDION' | 'GRID' | 'LIST'>('ACCORDION')
  const [faqImportOpen, setFaqImportOpen] = useState(false)

  const openNewFaqForm = () => {
    setEditingFaqId(null)
    setFaqDraftQuestion('')
    setFaqDraftAnswer('')
    setFaqDraftLayout('ACCORDION')
    setFaqFormOpen(true)
  }
  const openEditFaqForm = (id: string) => {
    const faq = faqItems.find((item) => item.id === id)
    if (!faq) return
    setEditingFaqId(id)
    setFaqDraftQuestion(faq.question)
    setFaqDraftAnswer(faq.answer)
    setFaqDraftLayout(faq.layout)
    setFaqFormOpen(true)
  }
  const saveFaqDraft = () => {
    if (!faqDraftQuestion.trim() || !faqDraftAnswer.trim()) return
    if (editingFaqId) {
      setFaqItems((current) =>
        current.map((item) =>
          item.id === editingFaqId
            ? { ...item, question: faqDraftQuestion, answer: faqDraftAnswer, layout: faqDraftLayout }
            : item
        )
      )
    } else {
      setFaqItems((current) => [
        ...current,
        {
          id: `faq-new-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          question: faqDraftQuestion,
          answer: faqDraftAnswer,
          isPublished: true,
          layout: faqDraftLayout,
        },
      ])
    }
    setFaqFormOpen(false)
  }
  const removeFaqItem = (id: string) => {
    setFaqItems((current) => current.filter((item) => item.id !== id))
  }
  const toggleFaqPublished = (id: string) => {
    setFaqItems((current) => current.map((item) => (item.id === id ? { ...item, isPublished: !item.isPublished } : item)))
  }
  const importFaqFrom = (faqsToImport: Array<{ question: string; answer: string; layout: 'ACCORDION' | 'GRID' | 'LIST' }>) => {
    setFaqItems((current) => [
      ...current,
      ...faqsToImport.map((faq, index) => ({
        id: `faq-import-${Date.now()}-${index}`,
        question: faq.question,
        answer: faq.answer,
        isPublished: true,
        layout: faq.layout,
      })),
    ])
    setFaqImportOpen(false)
  }

  const [galleryImages, setGalleryImages] = useState<(string | null)[]>(
    Array.isArray(initialMetadata.gallery)
      ? initialMetadata.gallery.map((item) => item ?? null)
      : []
  )
  const [variants, setVariants] = useState<Array<{ name: string; priceDelta: string; stockDelta: string }>>(
    Array.isArray(initialState.variants) && initialState.variants.length > 0
      ? initialState.variants.map((variant) => ({
          name: String(variant?.name ?? ''),
          priceDelta: variant?.price_delta != null ? String(variant.price_delta) : '',
          stockDelta: variant?.stock_delta != null ? String(variant.stock_delta) : '',
        }))
      : Array.isArray(initialMetadata.variants)
      ? initialMetadata.variants.map((variant) => ({
          name: String(variant?.name ?? ''),
          priceDelta: variant?.priceDelta != null ? String(variant.priceDelta) : '',
          stockDelta: variant?.stockDelta != null ? String(variant.stockDelta) : '',
        }))
      : []
  )
  const [availabilityScope, setAvailabilityScope] = useState<AvailabilityScope>(initialMetadata.availability?.scope ?? 'PARTOUT')
  const [availabilityNote, setAvailabilityNote] = useState(initialMetadata.availability?.note ?? '')
  const [stockMode, setStockMode] = useState<'UNLIMITED' | 'TRACKED' | 'PREORDER' | 'OUT_OF_STOCK'>(
    initialState.stock_mode ?? initialMetadata.stockMode ?? 'TRACKED'
  )
  const [lowStockThreshold, setLowStockThreshold] = useState(
    initialState.low_stock_threshold
      ? String(initialState.low_stock_threshold)
      : initialMetadata.lowStockThreshold
      ? String(initialMetadata.lowStockThreshold)
      : ''
  )
  const [allowBackorder, setAllowBackorder] = useState(initialState.allow_backorder ?? initialMetadata.allowBackorder ?? false)
  const [pickupAvailable, setPickupAvailable] = useState(initialMetadata.pickup?.available ?? false)
  const [pickupLocation, setPickupLocation] = useState(initialMetadata.pickup?.location ?? '')
  const [deliveryEnabled, setDeliveryEnabled] = useState(initialMetadata.delivery?.enabled ?? false)
  const [deliveryFee, setDeliveryFee] = useState(
    initialMetadata.delivery?.fee ? String(initialMetadata.delivery.fee) : ''
  )
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    initialMetadata.delivery?.freeThreshold ? String(initialMetadata.delivery.freeThreshold) : ''
  )
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(
    Array.isArray(initialState.delivery_zones) && initialState.delivery_zones.length > 0
      ? initialState.delivery_zones.map((zone, index) => ({
          id: zone?.id ?? `zone-${index}`,
          name: zone?.name ?? '',
          fee: zone?.fee != null ? String(zone.fee) : '',
          estimatedMinDays: zone?.estimated_min_days != null ? String(zone.estimated_min_days) : '',
          estimatedMaxDays: zone?.estimated_max_days != null ? String(zone.estimated_max_days) : '',
          isActive: zone?.is_active ?? true,
        }))
      : Array.isArray(initialMetadata.delivery?.zones)
      ? initialMetadata.delivery.zones.map((zone, index) => ({
          id: zone?.id ?? `zone-${index}`,
          name: zone?.name ?? '',
          fee: zone?.fee != null ? String(zone.fee) : '',
          estimatedMinDays: zone?.estimatedMinDays != null ? String(zone.estimatedMinDays) : '',
          estimatedMaxDays: zone?.estimatedMaxDays != null ? String(zone.estimatedMaxDays) : '',
          isActive: zone?.isActive ?? true,
        }))
      : []
  )

  const addDeliveryZone = () => {
    setDeliveryZones((current) => [
      ...current,
      { id: `zone-${Date.now()}-${Math.floor(Math.random() * 10000)}`, name: '', fee: '', estimatedMinDays: '', estimatedMaxDays: '', isActive: true },
    ])
  }

  const updateDeliveryZone = (index: number, updates: Partial<DeliveryZone>) => {
    setDeliveryZones((current) => current.map((zone, i) => (i === index ? { ...zone, ...updates } : zone)))
  }

  const removeDeliveryZone = (index: number) => {
    setDeliveryZones((current) => current.filter((_, i) => i !== index))
  }


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error('Nom du produit requis')
      setSelectedTab('information')
      return
    }
    if (!price || Number(price) <= 0) {
      toast.error('Prix invalide')
      setSelectedTab('prix')
      return
    }
    if (ctaUrl && !ctaText.trim()) {
      toast.error('Le texte du CTA est requis si une URL est définie')
      setSelectedTab('prix')
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          name,
          slug: slug || null,
          description,
          price: Number(price),
          original_price: originalPrice ? Number(originalPrice) : null,
          stock: Number(stock),
          stock_mode: stockMode,
          low_stock_threshold: lowStockThreshold ? Number(lowStockThreshold) : null,
          allow_backorder: allowBackorder,
          category_id: categoryId === '' ? null : categoryId,
          image_url: imageUrl,
          type: productType,
          promo_label: promoLabel || null,
          promo_start_at: promoStartAt || null,
          promo_end_at: promoEndAt || null,
          promo_auto_renew: promoAutoRenew,
          cta_text: ctaText || null,
          cta_url: ctaUrl || null,
          cta_style: ctaStyle.toUpperCase(),
          is_available: isAvailable,
          is_hidden_from_shop: isHiddenFromShop,
          hide_sales_count: hideSalesCount,
          sales_limit: salesLimit ? Number(salesLimit) : null,
          restock_threshold: restockThreshold ? Number(restockThreshold) : null,
          restock_quantity: restockQuantity ? Number(restockQuantity) : null,
          post_purchase_instructions: postPurchaseInstructions || null,
          require_shipping_address: requireShippingAddress,
          file_password: filePassword || null,
          watermark_files: watermarkFiles,
          seo_title: seoProductTitle || null,
          seo_description: seoProductDescription || null,
          seo_thumbnail_url: seoThumbnailUrl || null,
          seo_keywords: seoKeywords || null,
          variants: variants
            .filter((variant) => variant.name.trim().length > 0)
            .map((variant) => ({
              name: variant.name,
              price_delta: variant.priceDelta ? Number(variant.priceDelta) : 0,
              stock_delta: variant.stockDelta ? Number(variant.stockDelta) : 0,
            })),
          delivery_zones: deliveryZones
            .filter((zone) => zone.name.trim().length > 0)
            .map((zone) => ({
              name: zone.name,
              fee: zone.fee ? Number(zone.fee) : null,
              estimated_min_days: zone.estimatedMinDays ? Number(zone.estimatedMinDays) : null,
              estimated_max_days: zone.estimatedMaxDays ? Number(zone.estimatedMaxDays) : null,
              is_active: zone.isActive,
            })),
          pricing_tiers: pricingTiers
            .filter((tier) => tier.label.trim().length > 0 && tier.price)
            .map((tier) => ({
              label: tier.label,
              price: Number(tier.price),
              is_default: tier.isDefault,
            })),
          faqs: faqItems.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            is_published: faq.isPublished,
            layout: faq.layout,
          })),
          metadata: {
            autoDiscount: {
              enabled: autoDiscountEnabled,
              type: autoDiscountType,
              value: autoDiscountValue ? Number(autoDiscountValue) : null,
            },
            seo: {
              ogTitle: ogTitle || null,
              ogDescription: ogDescription || null,
              ogImage: ogImageUrl || null,
            },
            salesPage: {
              body: pageContent || null,
              hero: {
                headline: pageHeroHeadline || null,
                subheadline: pageHeroSubheadline || null,
                imageUrl: pageHeroImageUrl || null,
                ctaText: pageHeroCtaText || null,
                ctaUrl: pageHeroCtaUrl || null,
              },
              ctaColor: pageHeroCtaColor || null,
              sections: salesPageSections.length > 0 ? normalizeSections(salesPageSections) : null,
            },

            visibility: {
              showStock,
              showRelatedProducts,
            },
            gallery: galleryImages.filter(Boolean),
            availability: {
              scope: availabilityScope,
              note: availabilityNote || null,
            },
            pickup: {
              available: pickupAvailable,
              location: pickupAvailable ? pickupLocation || null : null,
            },
            delivery: {
              enabled: deliveryEnabled,
              fee: deliveryFee ? Number(deliveryFee) : null,
              freeThreshold: freeDeliveryThreshold ? Number(freeDeliveryThreshold) : null,
            },
          },
        }

        const response = await fetch(apiEndpoint, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        console.log('📤 Sending product with image_url:', payload.image_url)
        const result = await response.json()
        console.log('📥 Server response:', result)
        
        if (!response.ok || !result.success) {
          toast.error(result.error || 'Impossible de sauvegarder le produit')
          return
        }

        toast.success('Produit enregistré avec succès ✅')
        onSuccess?.()
      } catch (error) {
        console.error('Product save error:', error)
        toast.error('Erreur serveur lors de l’enregistrement')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      <div className="fixed right-4 bottom-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setHelpOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--popover)] px-4 py-2 text-xs font-semibold text-[var(--popover-foreground)] shadow-2xl transition hover:bg-[var(--surface-2)]"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
          {helpOpen ? 'Masquer l’aide' : 'Aide page'}
        </button>
      </div>
      {helpOpen && (
        <div
          className="pointer-events-auto fixed z-40 max-w-sm rounded-4xl border border-[var(--border)] bg-[var(--popover)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl text-[var(--popover-foreground)]"
          style={{ right: helpPosition.right, bottom: helpPosition.bottom, minWidth: 320 }}
          onPointerDown={handleHelpPointerDown}
          onPointerMove={handleHelpPointerMove}
          onPointerUp={handleHelpPointerUp}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Conseils page de vente</p>
              <p className="text-xs text-muted-foreground">Déplace la bulle si elle te dérange.</p>
            </div>
            <button
              type="button"
              onClick={() => setHelpOpen(false)}
              className="text-xs font-semibold text-destructive"
            >
              Fermer
            </button>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1. Commence par un hero clair avec un bénéfice client.</li>
            <li>2. Raccourcis le texte et utilise des listes pour être lisible.</li>
            <li>3. Ajoute un bouton visible et une accroche simple.</li>
            <li>4. Prévisualise ta page en direct dans la carte ci-dessous.</li>
            <li>5. Si le texte est trop coloré, utilise le bouton de réinitialisation.</li>
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="flex min-w-full gap-2 rounded-3xl border border-border bg-[var(--surface)] px-2 py-2">
          {builderTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTab(tab.key)}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                selectedTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-foreground/80 hover:bg-[var(--surface-2)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-2">
          {builderTabs.find((tab) => tab.key === selectedTab)?.label}
        </p>
        <p>{builderTabs.find((tab) => tab.key === selectedTab)?.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-5">
          {selectedTab === 'information' && (
            <AnimatedSectionContent title="Informations" description="Nom, description, type et catégorie du produit." >
              <div className="space-y-4">
                        <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Nom du produit <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Calculatrice scientifique Casio"
                    className="h-10"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Slug interne
                    </label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="ex: calculatrice-casio"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Note de disponibilité
                    </label>
                    <Input
                      value={availabilityNote}
                      onChange={(e) => setAvailabilityNote(e.target.value)}
                      placeholder="Ex: Disponible en 48h"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Description longue
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décris ton produit en détail..."
                    rows={6}
                    className="bg-[var(--surface-2)]"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Type de produit
                    </label>
                    <Select value={productType} onValueChange={(value) => setProductType(value as 'PHYSICAL' | 'DIGITAL')}>
                    <SelectTrigger className="w-full" size="default">
                      <SelectValue placeholder="Type de produit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PHYSICAL">Physique</SelectItem>
                      <SelectItem value="DIGITAL">Numérique</SelectItem>
                    </SelectContent>
                  </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Catégorie
                    </label>
                    <Select value={categoryId} onValueChange={(value) => setCategoryId(value === '__none' ? '' : value)}>
                      <SelectTrigger className="w-full" size="default">
                        <SelectValue placeholder="Sans catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Sans catégorie</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'medias' && (
            <AnimatedSectionContent title="Médias" description="Image principale et ressources visuelles." >
              <div className="space-y-5">
                <Card className="rounded-3xl border border-border p-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      Image principale
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload value={imageUrl} onChange={setImageUrl} bucket="products" />
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-border p-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      Galerie produit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {galleryImages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Ajoute des images supplémentaires pour enrichir la page de vente.
                      </p>
                    ) : null}

                    {galleryImages.map((image, index) => (
                      <div key={index} className="space-y-2 rounded-3xl border border-border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                            Image {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => setGalleryImages((current) => current.filter((_, i) => i !== index))}
                            className="text-xs font-semibold text-destructive"
                          >
                            Supprimer
                          </button>
                        </div>
                        <ImageUpload
                          value={image}
                          onChange={(value) => setGalleryImages((current) => current.map((item, i) => i === index ? value : item))}
                          bucket="products"
                        />
                      </div>
                    ))}

                    <Button type="button" variant="outline" size="sm" onClick={() => setGalleryImages((current) => [...current, null])}>
                      Ajouter une image de galerie
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'prix' && (
            <AnimatedSectionContent title="Prix" description="Prix principal, prix d’origine et CTA marketing." >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Prix (FCFA) <span style={{ color: 'var(--primary)' }}>*</span>
                    </label>
                    <Input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      type="number"
                      min="1"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Prix d&apos;origine
                    </label>
                    <Input
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="Ex: 59 900"
                      type="number"
                      min="0"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                {/* URL du produit — lien personnalisé, facile à retenir */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    URL du produit
                  </label>
                  <p className="text-xs" style={{ color: 'var(--subtle)' }}>Crée un lien personnalisé facile à retenir</p>
                  <div className="flex items-stretch overflow-hidden rounded-xl" style={{ border: '1px solid var(--border)' }}>
                    <span
                      className="flex items-center px-3 text-xs shrink-0"
                      style={{ background: 'var(--surface-2)', color: 'var(--muted-foreground)' }}
                    >
                      {shopSlug ? `campus-market.com/${shopSlug}/` : 'campus-market.com/…/'}
                    </span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                      placeholder="mon-produit"
                      className="h-10 flex-1 px-3 text-sm outline-none"
                      style={{ background: 'var(--surface-2)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Libellé promotionnel
                    </label>
                    <Input
                      value={promoLabel}
                      onChange={(e) => setPromoLabel(e.target.value)}
                      placeholder="Ex: Offre spéciale"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                {/* Période de validité du prix promo */}
                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Période de validité du prix de vente</p>
                  <p className="mt-1 text-xs">Créez l’urgence avec des offres limitées dans le temps</p>
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        À partir de
                      </label>
                      <Input
                        value={promoStartAt}
                        onChange={(e) => setPromoStartAt(e.target.value)}
                        type="datetime-local"
                        className="h-10"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        À
                      </label>
                      <Input
                        value={promoEndAt}
                        onChange={(e) => setPromoEndAt(e.target.value)}
                        type="datetime-local"
                        className="h-10"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                  </div>
                  <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                    <span className="text-sm text-foreground">Renouveler automatiquement le prix de vente</span>
                    <Switch checked={promoAutoRenew} onCheckedChange={setPromoAutoRenew} />
                  </label>
                </div>

                {/* Réduction automatique — relance panier abandonné */}
                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <label className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-semibold text-foreground">Réduction automatique ⚡️</span>
                      <span className="mt-1 block text-xs">Offrez des réductions automatiques aux clients lors du 3ème rappel d’abandon.</span>
                    </span>
                    <Switch checked={autoDiscountEnabled} onCheckedChange={setAutoDiscountEnabled} />
                  </label>
                  {autoDiscountEnabled && (
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Type de réduction
                        </label>
                        <Select value={autoDiscountType} onValueChange={(value) => setAutoDiscountType(value as 'FIXED' | 'PERCENT')}>
                          <SelectTrigger className="w-full" size="default">
                            <SelectValue placeholder="Type de réduction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIXED">Réduction fixe (FCFA)</SelectItem>
                            <SelectItem value="PERCENT">Réduction en %</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Valeur
                        </label>
                        <Input
                          value={autoDiscountValue}
                          onChange={(e) => setAutoDiscountValue(e.target.value)}
                          placeholder={autoDiscountType === 'FIXED' ? 'Ex: 2500' : 'Ex: 10'}
                          type="number"
                          min="0"
                          className="h-10"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tarifs alternatifs */}
                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Ajoutez un tarif alternatif</p>
                  <p className="mt-1 text-xs">
                    Les variantes de prix vous permettent de créer plusieurs tarifs pour ce produit. Partagez un lien de paiement unique pour chaque tarif.
                  </p>
                  <div className="mt-3 space-y-3">
                    {pricingTiers.map((tier, index) => (
                      <div key={tier.id ?? index} className="space-y-2 rounded-2xl border border-border bg-[var(--surface)] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-xs text-foreground">
                            <Switch checked={tier.isDefault} onCheckedChange={(value) => updatePricingTier(index, { isDefault: value })} />
                            Tarif par défaut
                          </label>
                          <button
                            type="button"
                            onClick={() => removePricingTier(index)}
                            className="text-xs font-semibold text-destructive"
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={tier.label}
                            onChange={(e) => updatePricingTier(index, { label: e.target.value })}
                            placeholder="Nom du tarif (ex: Early bird)"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <Input
                            value={tier.price}
                            onChange={(e) => updatePricingTier(index, { price: e.target.value })}
                            placeholder="Prix (FCFA)"
                            type="number"
                            min="0"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addPricingTier}>
                    Ajouter un tarif alternatif
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Texte du CTA
                    </label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Ex: J'en profite"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      URL du CTA
                    </label>
                    <Input
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://"
                      type="url"
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Style du CTA
                  </label>
                  <Select value={ctaStyle} onValueChange={(value) => setCtaStyle(value as 'primary' | 'secondary')}>
                    <SelectTrigger className="w-full" size="default">
                      <SelectValue placeholder="Style du bouton" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primaire</SelectItem>
                      <SelectItem value="secondary">Secondaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'stock' && (
            <AnimatedSectionContent title="Stock" description="Quantité, disponibilité universitaire, variantes et livraison." >
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Mode de stock
                    </label>
                    <Select value={stockMode} onValueChange={(value) => setStockMode(value as typeof stockMode)}>
                      <SelectTrigger className="w-full" size="default">
                        <SelectValue placeholder="Mode de stock" />
                      </SelectTrigger>
                      <SelectContent>
                        {STOCK_MODE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {STOCK_MODE_OPTIONS.find((option) => option.value === stockMode)?.description}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Stock disponible
                    </label>
                    <Input
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                      type="number"
                      min="0"
                      disabled={stockMode === 'UNLIMITED'}
                      className="h-10"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                {stockMode === 'TRACKED' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Seuil d’alerte stock bas
                      </label>
                      <Input
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        placeholder="Ex: 3"
                        type="number"
                        min="0"
                        className="h-10"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                      />
                    </div>
                    <label className="flex items-center justify-between gap-3 self-end rounded-2xl border border-border bg-[var(--surface-2)] p-3">
                      <span className="text-sm text-foreground">Autoriser les commandes en rupture</span>
                      <Switch checked={allowBackorder} onCheckedChange={setAllowBackorder} />
                    </label>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Statut de publication
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-[var(--surface-2)] p-3">
                    <span className="text-sm text-foreground">Produit visible sur la marketplace</span>
                    <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                  </label>
                </div>

                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Visibilité publique</p>
                  <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                    <span>Afficher le stock sur la fiche produit</span>
                    <Switch checked={showStock} onCheckedChange={setShowStock} />
                  </label>
                  <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                    <span>Afficher les produits associés</span>
                    <Switch checked={showRelatedProducts} onCheckedChange={setShowRelatedProducts} />
                  </label>
                </div>

                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Disponibilité universitaire</p>
                  <p className="mt-1 text-xs">Choisis qui peut voir et acheter ce produit.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {AVAILABILITY_SCOPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAvailabilityScope(option.value)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          availabilityScope === option.value
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-border bg-[var(--surface)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Note de disponibilité (optionnelle)
                    </label>
                    <Input
                      value={availabilityNote}
                      onChange={(e) => setAvailabilityNote(e.target.value)}
                      placeholder="Ex: Disponible en 48h après commande"
                      className="h-10"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Variantes</p>
                  {variants.length === 0 && (
                    <p className="mt-3 text-sm">Ajoute des variantes si ton produit propose plusieurs options.</p>
                  )}
                  <div className="space-y-3 mt-3">
                    {variants.map((variant, index) => (
                      <div key={index} className="space-y-3 rounded-3xl border border-border p-4 bg-[var(--surface)]">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                            Variante {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}
                            className="text-xs font-semibold text-destructive"
                          >
                            Supprimer
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <Input
                            value={variant.name}
                            onChange={(e) => setVariants((current) => current.map((item, i) => i === index ? { ...item, name: e.target.value } : item))}
                            placeholder="Nom de la variante"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <Input
                            value={variant.priceDelta}
                            onChange={(e) => setVariants((current) => current.map((item, i) => i === index ? { ...item, priceDelta: e.target.value } : item))}
                            placeholder="+1500 ou -500"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <Input
                            value={variant.stockDelta}
                            onChange={(e) => setVariants((current) => current.map((item, i) => i === index ? { ...item, stockDelta: e.target.value } : item))}
                            placeholder="Impact stock"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setVariants((current) => [...current, { name: '', priceDelta: '', stockDelta: '' }])}>
                    Ajouter une variante
                  </Button>
                </div>

                {/* Exclusivité et visibilité */}
                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Exclusivité et visibilité</p>
                  <div className="mt-3 space-y-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                      Limite de ventes
                    </label>
                    <p className="text-xs">Rendez votre produit exclusif en limitant le nombre d’acheteurs</p>
                    <Input
                      value={salesLimit}
                      onChange={(e) => setSalesLimit(e.target.value)}
                      placeholder="Ex: 50"
                      type="number"
                      min="1"
                      className="h-10"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                    />
                  </div>
                  <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                    <span>
                      <span className="block text-sm text-foreground">Masquer sur la boutique</span>
                      <span className="block text-xs mt-0.5">Gardez ce produit privé - uniquement accessible avec un lien direct</span>
                    </span>
                    <Switch checked={isHiddenFromShop} onCheckedChange={setIsHiddenFromShop} />
                  </label>
                  <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                    <span>
                      <span className="block text-sm text-foreground">Masquer le nombre d’achats</span>
                      <span className="block text-xs mt-0.5">Gardez vos statistiques de vente confidentielles</span>
                    </span>
                    <Switch checked={hideSalesCount} onCheckedChange={setHideSalesCount} />
                  </label>
                </div>

                {/* Réapprovisionnement automatique */}
                {stockMode === 'TRACKED' && (
                  <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Réapprovisionnement automatique</p>
                    <p className="mt-1 text-xs">Ajoutez de nouvelles places automatiquement quand le stock atteint un seuil</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Seuil (stock minimum avant réapprovisionnement)
                        </label>
                        <Input
                          value={restockThreshold}
                          onChange={(e) => setRestockThreshold(e.target.value)}
                          placeholder="Ex: 5"
                          type="number"
                          min="0"
                          className="h-10"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Quantité à ajouter à chaque cycle
                        </label>
                        <Input
                          value={restockQuantity}
                          onChange={(e) => setRestockQuantity(e.target.value)}
                          placeholder="Ex: 20"
                          type="number"
                          min="1"
                          className="h-10"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Post-achat & protection (surtout pertinent pour les produits numériques) */}
                <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Instructions après achat</p>
                  <p className="mt-1 text-xs">Guidez vos nouveaux clients pour maximiser leur satisfaction</p>
                  <textarea
                    value={postPurchaseInstructions}
                    onChange={(e) => setPostPurchaseInstructions(e.target.value)}
                    placeholder="Ex: Rejoignez notre groupe WhatsApp avec ce lien..."
                    rows={3}
                    maxLength={5000}
                    className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />

                  {productType === 'DIGITAL' && (
                    <>
                      <div className="mt-4 space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Protégez vos fichiers avec un mot de passe
                        </label>
                        <p className="text-xs">Sécurisez votre contenu premium avec protection par mot de passe</p>
                        <Input
                          value={filePassword}
                          onChange={(e) => setFilePassword(e.target.value)}
                          placeholder="Laisser vide pour ne pas protéger"
                          className="h-10"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                        <span>
                          <span className="block text-sm text-foreground">Ajoutez des filigranes à vos fichiers</span>
                          <span className="block text-xs mt-0.5">Ajoutez automatiquement des filigranes avec les détails du client pour décourager le partage non autorisé</span>
                        </span>
                        <Switch checked={watermarkFiles} onCheckedChange={setWatermarkFiles} />
                      </label>
                    </>
                  )}
                </div>

                {productType === 'PHYSICAL' && (
                  <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Retrait sur place</p>
                    <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                      <span>Activer le retrait</span>
                      <Switch checked={pickupAvailable} onCheckedChange={setPickupAvailable} />
                    </label>
                    {pickupAvailable && (
                      <div className="mt-3 space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Point de retrait
                        </label>
                        <Input
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="Ex: ENEAM — entrée principale"
                          className="h-10"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                      <span>
                        <span className="block text-sm text-foreground">Collecter les adresses de livraison</span>
                        <span className="block text-xs mt-0.5">Récupérez les adresses clients pour vos produits physiques</span>
                      </span>
                      <Switch checked={requireShippingAddress} onCheckedChange={setRequireShippingAddress} />
                    </label>
                    {requireShippingAddress && (
                      <p className="mt-2 text-xs" style={{ color: 'var(--warning)' }}>
                        Demander les informations de livraison ajoute des étapes supplémentaires au paiement, ce qui peut réduire le taux de conversion.
                      </p>
                    )}
                  </div>
                )}

                {productType === 'PHYSICAL' && (
                  <div className="rounded-3xl border border-border bg-[var(--surface-2)] p-4 text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground">Livraison</p>
                    <label className="flex items-center justify-between gap-3 mt-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                      <span>Activer la livraison</span>
                      <Switch checked={deliveryEnabled} onCheckedChange={setDeliveryEnabled} />
                    </label>
                    {deliveryEnabled && (
                      <>
                        <div className="grid gap-3 mt-4 md:grid-cols-2">
                          <Input
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                            placeholder="Frais de livraison par défaut"
                            type="number"
                            className="h-10"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <Input
                            value={freeDeliveryThreshold}
                            onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                            placeholder="Seuil livraison gratuite"
                            type="number"
                            className="h-10"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                        </div>

                        <div className="mt-4 space-y-3">
                          <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                            Zones de livraison
                          </p>
                          {deliveryZones.length === 0 && (
                            <p className="text-xs">Aucune zone définie — ajoute au moins une zone (ex: campus, hors campus).</p>
                          )}
                          {deliveryZones.map((zone, index) => (
                            <div key={zone.id} className="space-y-3 rounded-2xl border border-border bg-[var(--surface)] p-3">
                              <div className="flex items-center justify-between gap-3">
                                <label className="flex items-center gap-2 text-xs text-foreground">
                                  <Switch checked={zone.isActive} onCheckedChange={(value) => updateDeliveryZone(index, { isActive: value })} />
                                  Zone active
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeDeliveryZone(index)}
                                  className="text-xs font-semibold text-destructive"
                                >
                                  Supprimer
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <Input
                                  value={zone.name}
                                  onChange={(e) => updateDeliveryZone(index, { name: e.target.value })}
                                  placeholder="Nom de la zone (ex: UAC)"
                                  className="h-10 col-span-2"
                                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                />
                                <Input
                                  value={zone.fee}
                                  onChange={(e) => updateDeliveryZone(index, { fee: e.target.value })}
                                  placeholder="Frais (FCFA)"
                                  type="number"
                                  className="h-10"
                                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                />
                                <Input
                                  value={zone.estimatedMinDays}
                                  onChange={(e) => updateDeliveryZone(index, { estimatedMinDays: e.target.value })}
                                  placeholder="Délai min (jours)"
                                  type="number"
                                  className="h-10"
                                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                />
                              </div>
                            </div>
                          ))}
                          <Button type="button" variant="outline" size="sm" onClick={addDeliveryZone}>
                            Ajouter une zone de livraison
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'page-de-vente' && (
            <AnimatedSectionContent title="Page de vente" description="Rédige ta page commerciale en direct avec un hero et un contenu riche." >
              <div className="space-y-6">
                <Card className="rounded-3xl border border-border p-6">
                  <CardHeader className="pb-4">
                    <div>
                      <CardTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        Hero de la page
                      </CardTitle>
                      <CardDescription>
                        Saisis le titre, le sous-titre, l’image et le bouton principal de ton landing page.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Titre de la page
                        </label>
                        <Input
                          value={pageHeroHeadline}
                          onChange={(e) => setPageHeroHeadline(e.target.value)}
                          placeholder="Ton message le plus fort"
                          className="h-10"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Sous-titre
                        </label>
                        <Input
                          value={pageHeroSubheadline}
                          onChange={(e) => setPageHeroSubheadline(e.target.value)}
                          placeholder="Accroche qui attire l’attention"
                          className="h-10"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Image de couverture
                        </label>
                        <ImageUpload value={pageHeroImageUrl} onChange={setPageHeroImageUrl} bucket="products" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Bouton principal
                        </label>
                        <div className="grid gap-3">
                          <Input
                            value={pageHeroCtaText}
                            onChange={(e) => setPageHeroCtaText(e.target.value)}
                            placeholder="Texte du bouton"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <Input
                            value={pageHeroCtaUrl}
                            onChange={(e) => setPageHeroCtaUrl(e.target.value)}
                            placeholder="URL du bouton"
                            className="h-10"
                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Couleur du bouton</label>
                            <input
                              type="color"
                              value={pageHeroCtaColor || '#3B82F6'}
                              onChange={(e) => setPageHeroCtaColor(e.target.value)}
                              className="h-7 w-9 cursor-pointer rounded-md border border-[var(--border)] p-0"
                              style={{ background: 'transparent' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border border-border p-6">
                  <CardHeader className="pb-4">
                    <div>
                      <CardTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        Éditeur riche
                      </CardTitle>
                      <CardDescription>
                        Rédige ton argumentaire comme une vraie landing page, avec mise en forme et médias.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor value={pageContent} onChange={setPageContent} label="Argumentaire" />
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border border-border p-6">
                  <CardHeader className="pb-4">
                    <div>
                      <CardTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        Prévisualisation
                      </CardTitle>
                      <CardDescription>
                        Regarde ta page commerciale avec le hero et le contenu riche en instantané.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="rounded-3xl border border-border bg-[var(--surface)] p-6">
                      {pageHeroImageUrl ? (
                        <div className="relative h-72 overflow-hidden rounded-3xl mb-6">
                          <Image src={pageHeroImageUrl} alt={pageHeroHeadline || 'Couverture page de vente'} fill className="object-cover" />
                        </div>
                      ) : null}
                      <div className="space-y-4">
                        <h2 className="text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>
                          {pageHeroHeadline || 'Titre de la page de vente'}
                        </h2>
                        <p className="text-sm leading-7 text-muted-foreground">
                          {pageHeroSubheadline || 'Sous-titre percutant pour donner envie de lire la suite.'}
                        </p>
                        {pageHeroCtaText && pageHeroCtaUrl ? (
                          <a
                            href={pageHeroCtaUrl}
                            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition"
                            style={pageHeroCtaColor ? { background: pageHeroCtaColor, color: 'var(--primary-foreground)' } : undefined}
                          >
                            {pageHeroCtaText}
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-border bg-[var(--surface)] p-6">
                      <div className="prose max-w-full prose-sm prose-headings:text-base prose-a:text-primary prose-img:rounded-3xl prose-img:max-w-full">
                        <RichTextRenderer value={pageContent || ''} />
                      </div>
                    </div>
                    {salesPageSections.some((section) => section.isVisible) ? (
                      <div className="space-y-4">
                        {salesPageSections.map((section) => renderSectionPreview(section))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'faq' && (
            <AnimatedSectionContent title="Questions fréquentes" description="Réponds aux questions les plus posées avant qu'elles ne soient posées.">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={openNewFaqForm}>
                    Ajouter une question
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFaqImportOpen(true)}>
                    <Download size={14} className="mr-1.5" />
                    Importer depuis un autre produit
                  </Button>
                </div>

                {faqItems.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Aucune question pour l’instant. Ajoute les questions que tes acheteurs posent le plus souvent.
                  </p>
                ) : (
                  <SortableList
                    items={faqItems}
                    onReorder={setFaqItems}
                    className="space-y-2"
                    renderItem={(faq) => (
                      <FaqRow
                        faq={faq}
                        onEdit={() => openEditFaqForm(faq.id)}
                        onDelete={() => removeFaqItem(faq.id)}
                        onTogglePublished={() => toggleFaqPublished(faq.id)}
                      />
                    )}
                  />
                )}
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'marketing' && (
            <AnimatedSectionContent title="Marketing" description="Outils promotionnels pour ce produit.">
              <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border p-12 text-center">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                  style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}
                >
                  À venir
                </span>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Codes promo, campagnes de relance et autres outils marketing arrivent bientôt pour ce produit.
                </p>
              </div>
            </AnimatedSectionContent>
          )}

          {selectedTab === 'seo' && (
            <AnimatedSectionContent title="SEO" description="Aperçu moteur de recherche, mots-clés et image de partage." >
              <div className="space-y-6">
                {/* Aperçu façon résultat Google */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Aperçu</p>
                  <div className="rounded-2xl border border-border bg-[var(--surface-2)] p-4">
                    <p className="text-xs" style={{ color: '#4D7C0F' }}>
                      campus-market.com{shopSlug ? `/${shopSlug}` : ''}/{slug || 'mon-produit'}
                    </p>
                    <p className="mt-1 text-base font-medium truncate" style={{ color: '#1a0dab' }}>
                      {seoProductTitle || name || 'Titre de la page'}
                    </p>
                    <p className="mt-1 text-sm line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                      {seoProductDescription || description || 'La meta description apparaîtra ici.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Titre de la page
                  </label>
                  <Input
                    value={seoProductTitle}
                    onChange={(e) => setSeoProductTitle(e.target.value)}
                    placeholder={name || 'Titre SEO — 50 à 70 caractères'}
                    maxLength={160}
                    className="h-10"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Meta description
                  </label>
                  <Textarea
                    value={seoProductDescription}
                    onChange={(e) => setSeoProductDescription(e.target.value)}
                    rows={3}
                    maxLength={320}
                    className="bg-[var(--surface-2)]"
                    style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Mots clés
                  </label>
                  <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                    Séparés par des virgules — aide au positionnement sur les moteurs de recherche.
                  </p>
                  <Input
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="Ex: calculatrice, casio, fournitures scolaires"
                    className="h-10"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Miniature
                  </label>
                  <p className="text-xs" style={{ color: 'var(--subtle)' }}>
                    Aperçu du contenu du lien lors d’un partage. Format recommandé : 1200 × 627px.
                  </p>
                  <ImageUpload value={seoThumbnailUrl} onChange={(value) => setSeoThumbnailUrl(value ?? '')} bucket="products" />
                </div>

                <details className="rounded-2xl border border-border p-4">
                  <summary className="cursor-pointer text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    Réglages avancés Open Graph (réseaux sociaux)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Titre Open Graph
                        </label>
                        <Input
                          value={ogTitle}
                          onChange={(e) => setOgTitle(e.target.value)}
                          placeholder="Titre OG"
                          className="h-10"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                          Description Open Graph
                        </label>
                        <Textarea
                          value={ogDescription}
                          onChange={(e) => setOgDescription(e.target.value)}
                          rows={3}
                          className="bg-[var(--surface-2)]"
                          style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Image Open Graph (si différente de la miniature)
                      </label>
                      <ImageUpload value={ogImageUrl} onChange={setOgImageUrl} bucket="products" />
                    </div>
                  </div>
                </details>
              </div>
            </AnimatedSectionContent>
          )}
        </div>
      </div>

      {/* Panneau latéral d'édition de question FAQ — 1/3 de l'écran */}
      {faqFormOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFaqFormOpen(false)} />
          <div
            className="relative flex h-full w-full flex-col overflow-y-auto sm:w-2/3 lg:w-1/3"
            style={{ background: 'var(--popover)', borderLeft: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {editingFaqId ? 'Modifier la question' : 'Nouvelle question'}
              </h3>
              <button type="button" onClick={() => setFaqFormOpen(false)} className="text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Question
                </label>
                <Input
                  value={faqDraftQuestion}
                  onChange={(e) => setFaqDraftQuestion(e.target.value)}
                  placeholder="Ex: Livrez-vous en dehors du campus ?"
                  className="h-10"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Réponse
                </label>
                <RichTextEditor value={faqDraftAnswer} onChange={setFaqDraftAnswer} label="" placeholder="Rédige une réponse claire et complète..." />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                  Présentation sur la page
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: 'ACCORDION', label: 'Accordéon', icon: ChevronDown },
                      { value: 'GRID', label: 'Grille', icon: LayoutGrid },
                      { value: 'LIST', label: 'Liste', icon: ListIcon },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFaqDraftLayout(option.value)}
                      className="flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors"
                      style={{
                        borderColor: faqDraftLayout === option.value ? 'var(--primary)' : 'var(--border)',
                        background: faqDraftLayout === option.value ? 'var(--primary-dim)' : 'var(--surface-2)',
                      }}
                    >
                      <option.icon size={18} style={{ color: faqDraftLayout === option.value ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-border p-5">
              <Button type="button" onClick={saveFaqDraft} className="flex-1">
                {editingFaqId ? 'Enregistrer' : 'Ajouter la question'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setFaqFormOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
          </div>
      )}

      {faqImportOpen && (
        <FaqImportDialog onClose={() => setFaqImportOpen(false)} onImport={importFaqFrom} currentProductId={initialProductId} />
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function AnimatedSectionContent({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="rounded-3xl border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface FaqRowProps {
  faq: { id: string; question: string; isPublished: boolean }
  onEdit: () => void
  onDelete: () => void
  onTogglePublished: () => void
}

function FaqRow({ faq, onEdit, onDelete, onTogglePublished }: FaqRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border p-3"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>{faq.question}</p>
      </div>

      <button
        type="button"
        onClick={onTogglePublished}
        className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{
          background: faq.isPublished ? 'var(--primary-dim)' : 'var(--surface-2)',
          color: faq.isPublished ? 'var(--primary)' : 'var(--muted-foreground)',
        }}
        title="Basculer la publication sur la page de vente"
      >
        {faq.isPublished ? 'Publiée' : 'Masquée'}
      </button>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-[var(--surface-2)]"
          aria-label="Actions"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div
              className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border shadow-lg"
              style={{ borderColor: 'var(--border)', background: 'var(--popover)' }}
            >
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit() }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[var(--surface-2)]"
                style={{ color: 'var(--foreground)' }}
              >
                <Pencil size={13} /> Modifier
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete() }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-[var(--surface-2)]"
                style={{ color: 'var(--destructive)' }}
              >
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface FaqImportDialogProps {
  onClose: () => void
  onImport: (faqs: Array<{ question: string; answer: string; layout: 'ACCORDION' | 'GRID' | 'LIST' }>) => void
  currentProductId?: string
}

function FaqImportDialog({ onClose, onImport, currentProductId }: FaqImportDialogProps) {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Array<{ id: string; name: string; faqs: Array<{ question: string; answer: string; layout: 'ACCORDION' | 'GRID' | 'LIST' }> }>>([])
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch('/api/seller/products/faqs')
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => setProducts((data.products ?? []).filter((p: { id: string }) => p.id !== currentProductId)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [currentProductId])

  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const toggleQuestion = (index: number) => {
    setSelectedQuestions((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl"
        style={{ background: 'var(--popover)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Importer des questions</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun autre produit avec des questions à importer.</p>
          ) : !selectedProduct ? (
            <div className="space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => { setSelectedProductId(product.id); setSelectedQuestions(new Set()) }}
                  className="flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {product.name}
                  <span className="text-xs text-muted-foreground">{product.faqs.length} question(s)</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedProduct.faqs.map((faq, index) => (
                <label
                  key={index}
                  className="flex items-start gap-3 rounded-xl border p-3 text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(index)}
                    onChange={() => toggleQuestion(index)}
                    className="mt-0.5"
                  />
                  {faq.question}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border p-5">
          {selectedProduct ? (
            <>
              <Button
                type="button"
                className="flex-1"
                disabled={selectedQuestions.size === 0}
                onClick={() => onImport(selectedProduct.faqs.filter((_, index) => selectedQuestions.has(index)))}
              >
                Importer {selectedQuestions.size > 0 ? `(${selectedQuestions.size})` : ''}
              </Button>
              <Button type="button" variant="outline" onClick={() => setSelectedProductId(null)}>
                Retour
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
