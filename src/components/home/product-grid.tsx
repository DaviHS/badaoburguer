"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { api } from "@/trpc/react"
import { useCart } from "@/contexts/cart-context"
import { Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Category, Product } from "@/types"
import { formatCurrency } from "@/lib/utils/format"
import { LoadingSkeleton } from "@/components/shared/loading"
import Autoplay from "embla-carousel-autoplay"

export default function ProductGrid() {
  const { dispatch } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all")

  const { data: products = [], isLoading: productsLoading } = api.product.list.useQuery()
  const { data: categories = [], isLoading: categoriesLoading } = api.category.list.useQuery()
  const { data: allProductImages = [] } = api.productImage.listAll.useQuery() // ← Novo hook para todas as imagens

  const filteredProducts = products.filter((product) =>
    selectedCategory === "all" ? true : product.categoryId === selectedCategory
  )

  const handleAddToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product })
  }

  // Função para obter imagens de um produto específico
  const getProductImages = (productId: number) => {
    return allProductImages.filter(img => img.productId === productId)
  }

  return (
    <section id="produtos" className="space-y-8">
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Todos os Produtos
        </Button>
        {categories.map((c) => (
          <Button
            key={c.categoryId}
            variant={selectedCategory === c.categoryId ? "default" : "outline"}
            onClick={() => setSelectedCategory(c.categoryId)}
          >
            {c.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(productsLoading || categoriesLoading) ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-0">
                <LoadingSkeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <LoadingSkeleton className="h-6 w-3/4" />
                <LoadingSkeleton className="h-4 w-full" />
                <LoadingSkeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <LoadingSkeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 col-span-full">
            <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const productImages = getProductImages(product.productId)
            
            return (
              <Card key={product.productId} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <CardHeader className="p-0 relative">
                  {productImages.length > 0 ? (
                    <Carousel
                      className="w-full"
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      plugins={[
                        Autoplay({
                          delay: 3000,
                          stopOnInteraction: false,
                        }),
                      ]}
                    >
                      <CarouselContent>
                        {productImages.map((image) => (
                          <CarouselItem key={image.imageId}>
                            <div className="relative h-48 w-full">
                              <Image
                                src={image.url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      
                      {productImages.length > 1 && (
                        <>
                          <CarouselPrevious className="left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CarouselNext className="right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                      
                      {productImages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {productImages.map((_, index) => (
                            <div
                              key={index}
                              className="w-2 h-2 rounded-full bg-white/50"
                            />
                          ))}
                        </div>
                      )}
                    </Carousel>
                  ) : (
                    <div className="relative h-48 w-full bg-gray-200 flex items-center justify-center">
                      <Image
                        src="/placeholder.svg"
                        alt={product.name}
                        fill
                        className="object-cover opacity-50"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    </div>
                  )}
                  
                  {productImages.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                      {productImages.length} fotos
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="p-4">
                  <CardTitle className="font-playfair text-xl mb-2">{product.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description ?? ""}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(product.price)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.categoryId === product.categoryId)?.name || "Sem Categoria"}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={() =>
                      handleAddToCart({
                        ...product,
                        categoryId: product.categoryId ?? 0,
                        photos: getProductImages(product.productId).map((img) => ({
                          id: img.imageId,
                          url: img.url,
                          filename: `image-${img.imageId}`,
                        })),
                      })
                    }
                    className="w-full flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar ao Carrinho
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </section>
  )
}