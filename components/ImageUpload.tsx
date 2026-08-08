'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  // optional callback providing Cloudinary metadata after upload or null on remove
  onMeta?: ((meta: { url: string; public_id?: string; resource_type?: string; format?: string; width?: number; height?: number; bytes?: number; mediaId?: string | null } | null) => void) | undefined
  bucket?: string
  shopId?: string | null
  uploaderId?: string | null
}

export function ImageUpload({
  value,
  onChange,
  onMeta,
  bucket = 'products',
  shopId = null,
  uploaderId = null,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (!file.type.startsWith('image/')) {
      toast.error('Fichier invalide — image uniquement')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde — max 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', bucket)
      if (shopId) formData.append('shopId', shopId)
      if (uploaderId) formData.append('uploaderId', uploaderId)

      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || !result.url) {
        console.error('Cloudinary upload error', result)
        const msg = result?.error?.message || result?.error || result?.message || 'Upload Cloudinary échoué'
        toast.error(String(msg))
        setUploading(false)
        return
      }

      onChange(result.url)
        if (typeof onMeta === 'function') {
          onMeta({
            url: result.url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            mediaId: result.mediaId ?? null,
          })
        }
      toast.success('Image enregistrée avec succès ✅')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (typeof onMeta === 'function') onMeta(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden"
          style={{ aspectRatio: '16/9', background: 'var(--surface-2)' }}>
          <Image
            src={value}
            alt="Aperçu produit"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:bg-red-600/95"
            style={{ background: 'rgba(10,10,10,0.8)', color: '#F87171' }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01] hover:border-primary/60 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="animate-spin"
                style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                Upload en cours...
              </p>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary-border)' }}
              >
                <Upload size={20} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  Clique pour uploader une image
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--subtle)' }}>
                  PNG, JPG, WEBP — max 5MB
                </p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}