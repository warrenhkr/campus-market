'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'products',
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
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      onChange(publicUrl)
      toast.success('Image uploadée ✅')
    } catch {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
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
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center
              justify-center transition-all hover:scale-110"
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
          className="w-full flex flex-col items-center justify-center gap-3 py-10
            rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01]
            disabled:opacity-50 disabled:cursor-not-allowed"
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