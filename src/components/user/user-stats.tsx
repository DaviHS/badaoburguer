"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Calendar } from "lucide-react"

const mockUser = {
  createdAt: "2024-01-01",
  totalOrders: 15,
  totalSpent: 450.8,
}

export function UserStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockUser.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            Desde {new Date(mockUser.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          <span className="text-lg">💰</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {mockUser.totalSpent.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Valor total em compras</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Membro desde</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Date(mockUser.createdAt).toLocaleDateString("pt-BR")}
          </div>
          <p className="text-xs text-muted-foreground">Data de cadastro</p>
        </CardContent>
      </Card>
    </div>
  )
}
