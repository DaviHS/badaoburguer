"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/trpc/react"
import { useCart } from "@/lib/cart-context"
import { Plus, Filter } from "lucide-react"
import Image from "next/image"
import { Category, Product } from "@/types"
import { formatCurrency } from "@/lib/utils/format"
import { LoadingSkeleton } from "@/components/shared/loading"

export default function ProductGrid() {
  const { dispatch } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all")

  const { data: products = [], isLoading: productsLoading } = api.product.list.useQuery<Product[]>()
  const { data: categories = [], isLoading: categoriesLoading } = api.category.list.useQuery<Category[]>()

  const filteredProducts = products.filter((product) =>
    selectedCategory === "all" ? true : product.categoryId === selectedCategory
  )

  const handleAddToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product })
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

      {/* Grid de produtos */}
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
          filteredProducts.map((product) => (
            <Card key={product.productId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={"/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
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
                  onClick={() => handleAddToCart(product)}
                  className="w-full flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar ao Carrinho
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
