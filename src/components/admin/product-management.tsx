"use client"

import { useState, useEffect } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Ham } from "lucide-react"
import Image from "next/image"
import { Product } from "@/types"

export function ProductManagement() {
  const { data: products = [], refetch: refetchProducts } = api.product.list.useQuery()
  const { data: categories = [] } = api.category.list.useQuery()
  const createProduct = api.product.create.useMutation({ onSuccess: () => refetchProducts() })
  const updateProduct = api.product.update.useMutation({ onSuccess: () => refetchProducts() })
  const deleteProduct = api.product.delete.useMutation({ onSuccess: () => refetchProducts() })
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ name: "", description: "", price: "", categoryId: 0})

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", categoryId: categories?.[0]?.categoryId || 0})
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
    if (!formData.name || !formData.price || !formData.categoryId) return
    const payload = { ...formData, price: parseFloat(formData.price) }
    if (editingProduct) await updateProduct.mutateAsync({ productId: editingProduct.productId, ...payload })
    else await createProduct.mutateAsync(payload)
    setEditingProduct(null)
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) await deleteProduct.mutateAsync({ productId: id })
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.productId} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={"/placeholder.svg"}
                      alt={product.name}
                      className="object-cover"
                      fill
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-2">
                  <h4 className="font-semibold truncate">{product.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      R$ {parseFloat(product.price).toFixed(2).replace(".", ",")}
                    </span>
                    <Badge variant="outline">
                      {categories.find(c => c.categoryId === (product.categoryId ?? 0))?.name}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog({ ...product, categoryId: product.categoryId ?? 0 })}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.productId)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
