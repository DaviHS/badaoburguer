"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { ImagePlus, Trash2, Edit, X } from "lucide-react"
import Image from "next/image"
import { UploadButton } from "@/lib/uploadthing"
import { toast } from "sonner"

interface ProductImageManagerProps {
  productId: number
  productName: string
}

export function ProductImageManager({ productId, productName }: ProductImageManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: images = [], refetch } = api.productImage.listByProduct.useQuery({ productId })
  const deleteImage = api.productImage.delete.useMutation()
  const updateImage = api.productImage.update.useMutation()
  const createImage = api.productImage.create.useMutation() 

  const handleUploadComplete = async (res: any[]) => {
    try {
      for (const file of res) {
        await createImage.mutateAsync({
          productId,
          url: file.url,
          fileName: file.name,
          fileSize: file.size,
        })
      }
      refetch()
      toast.success("Imagens adicionadas com sucesso!")
    } catch (error) {
      toast.error("Erro ao salvar imagens no banco")
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    const toastId = toast.loading("Excluindo imagem...")
    try {
      await deleteImage.mutateAsync({ imageId }) // ← Use mutateAsync
      refetch()
      toast.success("Imagem excluída com sucesso!", { id: toastId })
    } catch (error) {
      toast.error("Erro ao excluir imagem", { id: toastId })
    }
  }

  const handleUpdateOrder = async (imageId: number, newOrder: number) => {
    try {
      await updateImage.mutateAsync({ imageId, order: newOrder }) // ← Use mutateAsync
      refetch()
    } catch (error) {
      toast.error("Erro ao atualizar ordem")
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ImagePlus className="h-4 w-4 mr-2" />
          Gerenciar Fotos
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Fotos - {productName}</DialogTitle>
          <DialogDescription>
            Adicione, remova ou reorganize as fotos do produto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <UploadButton
              endpoint="productImageUploader"
              onClientUploadComplete={handleUploadComplete}
              onUploadError={(error: Error) => {
                toast.error(`Erro no upload: ${error.message}`)
              }}
              appearance={{
                button: "bg-primary ut-ready:bg-primary/90 ut-uploading:bg-primary/50",
                allowedContent: "text-gray-500",
              }}
            />
          </div>

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={image.imageId} className="relative group border rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={productName}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Imagem?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir esta imagem?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteImage(image.imageId)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => handleUpdateOrder(image.imageId, index - 1)}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === images.length - 1}
                          onClick={() => handleUpdateOrder(image.imageId, index + 1)}
                        >
                          ↓
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-2 left-2">
                    <div className="bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ImagePlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma imagem cadastrada</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}