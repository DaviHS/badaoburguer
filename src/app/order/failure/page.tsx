// app/order/failure/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FailurePage() {
  const router = useRouter()

  return (
    <div className="container max-w-md mx-auto py-8">
      <Card className="border-red-200">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Pagamento Não Aprovado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Houve um problema com seu pagamento. Tente novamente ou escolha outra forma de pagamento.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/cart")}>
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}