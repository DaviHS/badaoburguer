"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Phone, Search } from "lucide-react"
import { getStatusInfo, translateStatusName } from "@/lib/utils/status"
import { LoadingSkeleton } from "@/components/shared/loading"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils/price"

export function OrderManagement() {
  const { data: ordersData = [], refetch, isLoading } = api.order.list.useQuery()
  const { data: statusList = [] } = api.order.getStatuses.useQuery()
  
  const updateStatusMutation = api.order.updateStatus.useMutation()

  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = ordersData.filter((order) => {
    const matchesStatus = filterStatus === "all" || String(order.status) === filterStatus
    const matchesSearch =
      searchTerm === "" ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      String(order.orderId).includes(searchTerm)
    return matchesStatus && matchesSearch
  })

  const handleStatusChange = (orderId: number, newStatusId: number) => {
    const toastId = toast.loading("Atualizando...")
    updateStatusMutation.mutate(
      { orderId, statusId: newStatusId },
      {
        onSuccess: () => {
          refetch()
          toast.success("Status do pedido atualizado!", { id: toastId })
        },
        onError: (error) => {
          toast.error(error.message || "Erro ao atualizar status.", { id: toastId })
        },
      }
    )
  }

  const stats = {
    total: ordersData.length,
    pendentes: ordersData.filter((o) => o.status === 0).length,
    pago: ordersData.filter((o) => o.status === 1).length,
    enviados: ordersData.filter((o) => o.status === 2).length,
    entregues: ordersData.filter((o) => o.status === 3).length,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-playfair text-2xl">Gerenciamento de Pedidos</CardTitle>
              <CardDescription>
                {stats.total} pedidos • {stats.pendentes} pendentes • {stats.pago} pago
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, telefone ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="w-full md:w-48">
                  <SelectItem value="all">Todos os pedidos</SelectItem>
                  {statusList.map((status) => (
                    <SelectItem key={status.statusId} value={String(status.statusId)}>
                      {translateStatusName(status.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-40" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm
                ? "Nenhum pedido encontrado com os filtros aplicados."
                : "Nenhum pedido encontrado."}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              return (
                <Card key={order.orderId} className="border-l-4 border-l-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Pedido #{order.orderId}</CardTitle>
                      <Badge
                        className={`flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.iconColor}`}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {order.customerName || "Cliente não identificado"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.customerPhone || "Telefone não informado"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerEmail || "Email não informado"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("pt-BR")
                            : ""}{" "}
                          às{" "}
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString("pt-BR")
                            : ""}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold">Itens do Pedido:</h4>
                        {order.items?.map((item) => (
                          <div key={item.orderItemId} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.productName || "Produto"}
                            </span>
                            <span>
                              {formatCurrency(Number(item.price) * item.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span className="text-primary">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {statusList.slice(0, 5).map((status) => (
                        <Button
                          key={status.statusId}
                          variant={order.status === status.statusId ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange(order.orderId, status.statusId)}
                          disabled={order.status === status.statusId}
                        >
                          {translateStatusName(status.name)}
                        </Button>
                      ))}
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
