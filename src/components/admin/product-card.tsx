"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Edit, Trash2, Ham } from "lucide-react"
import Image from "next/image"
import { Product } from "@/types"
import { formatCurrency } from "@/lib/utils/price"
import { ProductImageManager } from "./product-image-manager"
import { api } from "@/trpc/react"

interface ProductCardProps {
  product: Product
  categories: Array<{ categoryId: number; name: string }>
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export function ProductCard({ product, categories, onEdit, onDelete }: ProductCardProps) {
  const { data: productImages = [] } = api.productImage.listByProduct.useQuery({
    productId: product.productId
  });

  return (
    <Card key={product.productId} className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          {productImages.length > 0 ? (
            <Image
              src={productImages[0]?.url || "/placeholder.svg"}
              alt={product.name}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Ham className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {productImages.length > 1 && (
            <Badge className="absolute top-2 right-2">
              +{productImages.length - 1}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        <h4 className="font-semibold truncate">{product.name}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          <Badge variant="outline">
            {categories.find(c => c.categoryId === (product.categoryId ?? 0))?.name}
          </Badge>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit({ ...product, categoryId: product.categoryId ?? 0 })}
            className="flex-1"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <ProductImageManager 
            productId={product.productId} 
            productName={product.name} 
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Produto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.productId)}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}