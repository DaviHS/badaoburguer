"use client"

import { useState, useRef, useEffect } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import type { Product } from "@/types"
import { getStockStatus } from "@/lib/utils/status"
import { LoadingSkeleton } from "@/components/shared/loading"

export function StockManagement() {
  const { data: productsData, isLoading } = api.product.list.useQuery<Product[]>()
  const [products, setProducts] = useState<Product[]>(productsData || [])
  const [searchTerm, setSearchTerm] = useState("")
  const updateStockMutation = api.product.updateStock.useMutation()
  const timeoutRefs = useRef<{ [key: number]: NodeJS.Timeout }>({})

  useEffect(() => {
    if (productsData) setProducts(productsData)
  }, [productsData])

  const handleStockChange = (productId: number, value: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, stock: Math.max(0, value) } : p,
      ),
    )

    if (timeoutRefs.current[productId]) clearTimeout(timeoutRefs.current[productId])

    timeoutRefs.current[productId] = setTimeout(() => {
      const toastId = `update-stock-${productId}`

      toast.loading("Atualizando estoque...", { id: toastId })

      updateStockMutation.mutate(
        { productId, stock: Math.max(0, value) },
        {
          onSuccess: () => {
            toast.success("Estoque atualizado com sucesso!", { id: toastId })
          },
          onError: () => {
            toast.error("Erro ao atualizar o estoque.", { id: toastId })
          },
        },
      )
    }, 500)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lowStockProducts = filteredProducts.filter((p) => p.stock <= 5 && p.stock > 0)
  const outOfStockProducts = filteredProducts.filter((p) => p.stock === 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-playfair text-2xl">Controle de Estoque</CardTitle>
              <CardDescription>Visualize e gerencie o estoque dos produtos</CardDescription>
            </div>

            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produto por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">{filteredProducts.length}</div>
                  <p className="text-xs text-muted-foreground">Total de produtos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
                  <p className="text-xs text-muted-foreground">Estoque baixo</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
                  <p className="text-xs text-muted-foreground">Sem estoque</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <LoadingSkeleton key={i} className="h-40" />
                ))
              : filteredProducts.length === 0
              ? (
                <div className="text-center py-4 text-muted-foreground col-span-full">
                  Nenhum produto encontrado com os filtros aplicados.
                </div>
              )
              : filteredProducts.map((product) => {
                  const stockBadge = getStockStatus(product.stock)
                  return (
                    <div
                      key={product.productId}
                      className="flex flex-col justify-between p-4 border rounded-md"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{product.name}</span>
                          <span className="text-sm text-muted-foreground">Código: {product.code}</span>
                        </div>

                        <Badge className={`flex items-center gap-1 ${stockBadge.bg} ${stockBadge.text}`}>
                          {stockBadge.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStockChange(product.productId, product.stock - 1)
                          }
                          disabled={product.stock === 0}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>

                        <Input
                          type="number"
                          value={product.stock}
                          min={0}
                          onChange={(e) =>
                            handleStockChange(
                              product.productId,
                              Number(e.target.value) || 0,
                            )
                          }
                          className="w-20 text-center"
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStockChange(product.productId, product.stock + 1)
                          }
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
