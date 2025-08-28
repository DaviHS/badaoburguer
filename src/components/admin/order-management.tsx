"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, Truck, Phone, CreditCard } from "lucide-react"

export type Order = {
  id: string
  customerName: string
  customerPhone: string
  paymentMethod: "pix" | "dinheiro" | "cartao"
  status: "pendente" | "preparacao" | "enviado"
  createdAt: Date
  items: { id: string; name: string; quantity: number; price: number }[]
  total: number
}

interface OrderManagementProps {
  orders: Order[]
}

export function OrderManagement({ orders: initialOrders }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filterStatus, setFilterStatus] = useState<"all" | "pendente" | "preparacao" | "enviado">("all")

  const filteredOrders = orders.filter((order) => (filterStatus === "all" ? true : order.status === filterStatus))

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />
      case "preparacao":
        return <CheckCircle className="h-4 w-4" />
      case "enviado":
        return <Truck className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pendente":
        return "destructive"
      case "preparacao":
        return "secondary"
      case "enviado":
        return "default"
    }
  }

  const getPaymentIcon = (method: Order["paymentMethod"]) => {
    switch (method) {
      case "pix":
        return "📱"
      case "dinheiro":
        return "💵"
      case "cartao":
        return "💳"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Gerenciar Pedidos</h3>
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Pedidos</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="preparacao">Em Preparação</SelectItem>
            <SelectItem value="enviado">Enviados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                <Badge variant={getStatusColor(order.status)} className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {order.status === "pendente" && "Pendente"}
                  {order.status === "preparacao" && "Em Preparação"}
                  {order.status === "enviado" && "Enviado"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{order.customerName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {getPaymentIcon(order.paymentMethod)} {order.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("pt-BR")} às {order.createdAt.toLocaleTimeString("pt-BR")}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Itens do Pedido:</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-primary">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={order.status === "pendente" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "pendente")}
                  disabled={order.status === "pendente"}
                >
                  Pendente
                </Button>
                <Button
                  variant={order.status === "preparacao" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "preparacao")}
                  disabled={order.status === "preparacao"}
                >
                  Em Preparação
                </Button>
                <Button
                  variant={order.status === "enviado" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, "enviado")}
                  disabled={order.status === "enviado"}
                >
                  Enviado
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum pedido encontrado com este status.</p>
        </div>
      )}
    </div>
  )
}
