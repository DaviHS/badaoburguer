"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Clock, CheckCircle, XCircle, Search } from "lucide-react"

const mockOrders = [
  {
    id: "001",
    date: "2024-01-15",
    status: "entregue",
    total: 45.9,
    items: [
      { name: "Hambúrguer Picanha", quantity: 2, price: 18.9 },
      { name: "Espeto de Frango", quantity: 1, price: 8.1 },
    ],
  },
  {
    id: "002",
    date: "2024-01-10",
    status: "preparando",
    total: 32.5,
    items: [
      { name: "Hambúrguer Costela", quantity: 1, price: 16.9 },
      { name: "Espeto de Carne", quantity: 2, price: 7.8 },
    ],
  },
]

const statusConfig = {
  preparando: { label: "Preparando", icon: Clock },
  entregue: { label: "Entregue", icon: CheckCircle },
  cancelado: { label: "Cancelado", icon: XCircle },
}

export function UserOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchTerm) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "todos" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrar Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número do pedido ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status do pedido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="preparando">Preparando</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground text-center">
                {searchTerm || statusFilter !== "todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Você ainda não fez nenhum pedido"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon
            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                      <CardDescription>{new Date(order.date).toLocaleDateString("pt-BR")}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[order.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">Itens do pedido:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-semibold">Total: R$ {order.total.toFixed(2)}</span>
                      <Button variant="outline" size="sm">Ver Detalhes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
