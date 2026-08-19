'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryCarouselProps {
  images: string[]
  productName: string
}

export function ProductGalleryCarousel({ images, productName }: ProductGalleryCarouselProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  if (images.length === 0) return null

  const goTo = (nextIndex: number) => {
    setDirection(nextIndex > index ? 1 : -1)
    setIndex((nextIndex + images.length) % images.length)
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
        Galerie produit
      </h2>

      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-[var(--surface)]"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Galerie de ${productName}`}
      >
        <div className="relative aspect-[4/3]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute inset-0"
              drag={images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) goTo(index + 1)
                else if (info.offset.x > 60) goTo(index - 1)
              }}
            >
              <Image
                src={images[index]}
                alt={`${productName} — image ${index + 1} sur ${images.length}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-105"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => goTo(dotIndex)}
                  aria-label={`Aller à l'image ${dotIndex + 1}`}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: dotIndex === index ? '18px' : '6px',
                    background: dotIndex === index ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, thumbIndex) => (
            <button
              key={thumbIndex}
              type="button"
              onClick={() => goTo(thumbIndex)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-opacity"
              style={{
                borderColor: thumbIndex === index ? 'var(--primary)' : 'var(--border)',
                opacity: thumbIndex === index ? 1 : 0.6,
              }}
            >
              <Image src={image} alt={`Vignette ${thumbIndex + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
