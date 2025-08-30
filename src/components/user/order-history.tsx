"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { getStatusInfo, translateStatusName } from "@/lib/utils/status"
import { formatCurrency } from "@/lib/utils/price"
import { LoadingSkeleton } from "@/components/shared/loading"
import { formatOrderId } from "@/lib/utils/format"

export function OrderHistory() {
  const { data: orders = [], isLoading } = api.order.listByUser.useQuery()
  const { data: statusList = [] } = api.order.getStatuses.useQuery()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderId.toString().includes(searchTerm) ||
      order.items.some(item => item.productName!.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "todos" || order.statusName!.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">Histórico de Pedidos</CardTitle>
            <CardDescription>
              {isLoading ? <LoadingSkeleton className="h-5 w-24" /> : `${orders.length} pedidos encontrados`}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="w-full md:w-48">
                <SelectItem value="todos">Todos os pedidos</SelectItem>
                {statusList.map((status) => (
                  <SelectItem key={status.statusId} value={status.name.toLowerCase()}>
                    {translateStatusName(status.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-l-4 border-l-primary/20 animate-pulse">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <LoadingSkeleton className="h-5 w-24" />
                    <LoadingSkeleton className="h-5 w-20" />
                  </div>
                  <LoadingSkeleton className="h-4 w-32 mt-1" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className="flex justify-between text-sm">
                      <LoadingSkeleton className="h-4 w-3/4" />
                      <LoadingSkeleton className="h-4 w-16" />
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <LoadingSkeleton className="h-5 w-24" />
                    <LoadingSkeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredOrders.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">
              {searchTerm || statusFilter !== "todos"
                ? "Nenhum pedido encontrado com os filtros aplicados."
                : "Você ainda não fez nenhum pedido."}
            </p>
          ) : (
            filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status)
              return (
                <Card key={order.orderId} className="border-l-4 border-l-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Pedido {formatOrderId(order.orderId)}</CardTitle>
                      <Badge className={`flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.iconColor}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(order.createdAt!).toLocaleDateString("pt-BR")} às {new Date(order.createdAt!).toLocaleTimeString("pt-BR")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <div key={item.orderItemId} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.productName}</span>
                          <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
