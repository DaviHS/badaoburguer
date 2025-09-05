"use client"

import { useState, useEffect } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Plus, Ham } from "lucide-react"
import { Product } from "@/types"
import { LoadingSkeleton } from "@/components/shared/loading"
import { toast } from "sonner"
import { ProductCard } from "./product-card" // ← IMPORTE O NOVO COMPONENTE

export function ProductManagement() {
  const { data: products = [], refetch: refetchProducts, isLoading: productsLoading } = api.product.list.useQuery()
  const { data: categories = [], isLoading: categoriesLoading } = api.category.list.useQuery()
  const createProduct = api.product.create.useMutation({ onSuccess: () => refetchProducts() })
  const updateProduct = api.product.update.useMutation({ onSuccess: () => refetchProducts() })
  const deleteProduct = api.product.delete.useMutation({ onSuccess: () => refetchProducts() })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", price: "", categoryId: 0 })

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", categoryId: categories?.[0]?.categoryId || 0 })
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product, categoryId: product.categoryId ?? 0 })
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        categoryId: product.categoryId ?? 0,
      })
    } else {
      setEditingProduct(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Preencha todos os campos obrigatórios.")
      return
    }

    const payload = { ...formData, price: parseFloat(formData.price) }
    const toastId = toast.loading("Atualizando...")

    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ productId: editingProduct.productId, ...payload })
        toast.success("Produto atualizado com sucesso!", { id: toastId })
      } else {
        await createProduct.mutateAsync(payload)
        toast.success("Produto criado com sucesso!", { id: toastId })
      }
      setEditingProduct(null)
      setIsDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Falha ao salvar produto.", { id: toastId })
    }
  }

  const handleDelete = async (id: number) => {
    const toastId = toast.loading("Atualizando...")
    try {
      await deleteProduct.mutateAsync({ productId: id })
      toast.success("Produto excluído com sucesso.", { id: toastId })
    } catch {
      toast.error("Não foi possível excluir o produto.", { id: toastId })
    }
  }

  useEffect(() => { if (categories?.length) resetForm() }, [categories])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-playfair text-2xl">Gerenciar Produtos</CardTitle>
              <CardDescription>Visualize e gerencie todos os produtos cadastrados</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingProduct ? "Editar Produto" : "Adicionar Produto"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Ham className="h-5 w-5" />
                    {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
                  </DialogTitle>
                  <DialogDescription>
                    Preencha os dados do produto. Campos com * são obrigatórios.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço *</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria *</Label>
                    <Select value={formData.categoryId.toString()} onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((c) => (
                          <SelectItem key={c.categoryId} value={c.categoryId.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave}>{editingProduct ? "Salvar Alterações" : "Adicionar Produto"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {productsLoading || categoriesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={{ ...product, categoryId: product.categoryId ?? 0 }}
                  categories={categories}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}