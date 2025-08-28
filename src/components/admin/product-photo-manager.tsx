"use client"

import { useState } from "react"
import { UploadDropzone } from "@/lib/uploadthing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Star, MoveUp, MoveDown } from "lucide-react"
import Image from "next/image"

interface ProductPhoto {
  photoId: number
  url: string
  fileName: string
  alt?: string
  isMain: boolean
  order: number
}

interface ProductPhotoManagerProps {
  productId: number
  photos: ProductPhoto[]
  onPhotosChange: (photos: ProductPhoto[]) => void
}

export function ProductPhotoManager({ productId, photos, onPhotosChange }: ProductPhotoManagerProps) {
  const [localPhotos, setLocalPhotos] = useState<ProductPhoto[]>(photos)

  const handleUploadComplete = (res: any) => {
    const newPhotos = res.map((file: any, index: number) => ({
      photoId: Date.now() + index, // ID temporário
      url: file.url,
      fileName: file.name,
      alt: "",
      isMain: localPhotos.length === 0 && index === 0, // Primeira foto é principal se não há outras
      order: localPhotos.length + index,
    }))

    const updatedPhotos = [...localPhotos, ...newPhotos]
    setLocalPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  const updatePhoto = (photoId: number, updates: Partial<ProductPhoto>) => {
    const updatedPhotos = localPhotos.map((photo) => (photo.photoId === photoId ? { ...photo, ...updates } : photo))
    setLocalPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  const deletePhoto = (photoId: number) => {
    const updatedPhotos = localPhotos.filter((photo) => photo.photoId !== photoId)
    setLocalPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  const setMainPhoto = (photoId: number) => {
    const updatedPhotos = localPhotos.map((photo) => ({
      ...photo,
      isMain: photo.photoId === photoId,
    }))
    setLocalPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  const movePhoto = (photoId: number, direction: "up" | "down") => {
    const currentIndex = localPhotos.findIndex((photo) => photo.photoId === photoId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= localPhotos.length) return

    const updatedPhotos = [...localPhotos]
    const [movedPhoto] = updatedPhotos.splice(currentIndex, 1)
    updatedPhotos.splice(newIndex, 0, movedPhoto)

    // Atualizar ordem
    updatedPhotos.forEach((photo, index) => {
      photo.order = index
    })

    setLocalPhotos(updatedPhotos)
    onPhotosChange(updatedPhotos)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Fotos</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDropzone
            endpoint="productImageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`)
            }}
          />
        </CardContent>
      </Card>

      {localPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos do Produto ({localPhotos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {localPhotos
                .sort((a, b) => a.order - b.order)
                .map((photo, index) => (
                  <div key={photo.photoId} className="flex gap-4 p-4 border rounded-lg">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.alt || `Foto ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                        sizes="96px"
                      />
                      {photo.isMain && (
                        <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                          <Star className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor={`alt-${photo.photoId}`}>Texto Alternativo</Label>
                        <Input
                          id={`alt-${photo.photoId}`}
                          value={photo.alt || ""}
                          onChange={(e) => updatePhoto(photo.photoId, { alt: e.target.value })}
                          placeholder="Descreva a imagem para acessibilidade"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`main-${photo.photoId}`}
                          checked={photo.isMain}
                          onCheckedChange={() => setMainPhoto(photo.photoId)}
                        />
                        <Label htmlFor={`main-${photo.photoId}`}>Foto Principal</Label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => movePhoto(photo.photoId, "up")}
                        disabled={index === 0}
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => movePhoto(photo.photoId, "down")}
                        disabled={index === localPhotos.length - 1}
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deletePhoto(photo.photoId)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
