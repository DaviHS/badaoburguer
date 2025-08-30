"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountInfo } from "./account-info"
import { UserOrders } from "./user-orders"
import { UserStats } from "./user-stats"

export function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="perfil">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="pedidos">Meus Pedidos</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <AccountInfo />
        </TabsContent>
        <TabsContent value="pedidos">
          <UserOrders />
        </TabsContent>
        <TabsContent value="estatisticas">
          <UserStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
