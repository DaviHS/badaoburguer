// app/order/success/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Limpar carrinho ou fazer outras ações necessárias
    console.log("Pagamento aprovado!")
  }, [])

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Pagamento Aprovado!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Seu pedido foi confirmado e o pagamento foi aprovado com sucesso.
          </p>
          <p className="text-sm text-muted-foreground">
            Você receberá uma confirmação em instantes.
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