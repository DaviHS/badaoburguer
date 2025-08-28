"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { MessageCircle, User, CreditCard, Banknote, Smartphone } from "lucide-react"

interface CheckoutFormProps {
  onClose: () => void
}

export function CheckoutForm({ onClose }: CheckoutFormProps) {
  const { state, dispatch } = useCart()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix" | "cartao">("pix")
  const [observations, setObservations] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatWhatsAppMessage = () => {
    const itemsList = state.items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} - R$ ${(Number(item.price) * item.quantity)
            .toFixed(2)
            .replace(".", ",")}`
      )
      .join("\n")

    const paymentMethodText = {
      dinheiro: "💵 Dinheiro",
      pix: "📱 PIX",
      cartao: "💳 Cartão",
    }

    return `🍔 *PEDIDO BADÃO GRILL & BURGUER*

👤 *Cliente:* ${customerName}
📞 *Telefone:* ${customerPhone}

📋 *Itens do Pedido:*
${itemsList}

💰 *Total:* R$ ${state.items
      .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
      .toFixed(2)
      .replace(".", ",")}
💳 *Forma de Pagamento:* ${paymentMethodText[paymentMethod]}

${observations ? `📝 *Observações:* ${observations}` : ""}

---
_Pedido realizado através do site Badão Grill & Burguer_
_"O Melhor tem Nome"_`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (state.items.length === 0) {
      alert("Seu carrinho está vazio.")
      return
    }

    setIsSubmitting(true)

    try {
      const message = formatWhatsAppMessage()
      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = "5511967701575" // Número do WhatsApp da empresa
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")

      dispatch({ type: "CLEAR_CART" })
      onClose()
      alert("Pedido enviado com sucesso! Você será redirecionado para o WhatsApp.")
    } catch (error) {
      console.error("Erro ao enviar pedido:", error)
      alert("Erro ao enviar pedido. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = state.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone/WhatsApp *</Label>
            <Input
              id="phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pix" id="pix" />
              <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer">
                <Smartphone className="h-4 w-4" />
                PIX (Recomendado)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dinheiro" id="dinheiro" />
              <Label htmlFor="dinheiro" className="flex items-center gap-2 cursor-pointer">
                <Banknote className="h-4 w-4" />
                Dinheiro
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cartao" id="cartao" />
              <Label htmlFor="cartao" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" />
                Cartão (Débito/Crédito)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações (Opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Alguma observação especial sobre seu pedido?"
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>R$ {(Number(item.price) * item.quantity).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || state.items.length === 0}
        className="w-full flex items-center gap-2"
        size="lg"
      >
        <MessageCircle className="h-5 w-5" />
        {isSubmitting ? "Enviando..." : "Enviar Pedido via WhatsApp"}
      </Button>
    </div>
  )
}
