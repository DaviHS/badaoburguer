// app/order/pending/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PendingPage() {
  const router = useRouter()

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card className="border-yellow-200">
        <CardHeader className="text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Pagamento em Análise</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Seu pagamento está sendo processado. Aguarde a confirmação.
          </p>
          <p className="text-sm text-muted-foreground">
            Você receberá uma atualização assim que o pagamento for confirmado.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/")}>
              Voltar ao Início
            </Button>
            <Button variant="outline" onClick={() => router.push("/my-orders")}>
              Meus Pedidos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}