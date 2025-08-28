"use client"

import { useState } from "react"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface ProductPhoto {
  photoId: number
  url: string
  alt?: string
  isMain: boolean
  order: number
}

interface ProductPhotoCarouselProps {
  photos: ProductPhoto[]
  productName: string
  className?: string
}

export function ProductPhotoCarousel({ photos, productName, className }: ProductPhotoCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Ordenar fotos: principal primeiro, depois por ordem
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1
    if (!a.isMain && b.isMain) return 1
    return a.order - b.order
  })

  if (sortedPhotos.length === 0) {
    return (
      <div className={cn("aspect-square bg-muted rounded-lg flex items-center justify-center", className)}>
        <span className="text-muted-foreground">Sem imagem</span>
      </div>
    )
  }

  if (sortedPhotos.length === 1) {
    return (
      <div className={cn("aspect-square relative overflow-hidden rounded-lg", className)}>
        <Image
          src={sortedPhotos[0].url || "/placeholder.svg"}
          alt={sortedPhotos[0].alt || `${productName} - Foto principal`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Carrossel principal */}
      <Carousel className="w-full">
        <CarouselContent>
          {sortedPhotos.map((photo, index) => (
            <CarouselItem key={photo.photoId}>
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <Image
                  src={photo.url || "/placeholder.svg"}
                  alt={photo.alt || `${productName} - Foto ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Thumbnails */}
      {sortedPhotos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedPhotos.map((photo, index) => (
            <button
              key={photo.photoId}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 relative overflow-hidden rounded-md border-2 transition-colors",
                selectedIndex === index ? "border-primary" : "border-transparent hover:border-muted-foreground",
              )}
            >
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.alt || `${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
