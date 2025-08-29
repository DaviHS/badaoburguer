"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { MessageCircle, User, CreditCard, Banknote, Smartphone } from "lucide-react"
import { formatCurrency } from "@/lib/utils/price"
import { toast } from "sonner"

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

  const createOrder = api.order.create.useMutation()
  const total = state.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Preencha seu nome e telefone.")
      return
    }

    if (state.items.length === 0) {
      toast.error("O carrinho está vazio.")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Enviando pedido...")

    try {
      const { orderId } = await createOrder.mutateAsync({
        userId: 1,
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })

      const code = `BADAO-${orderId.toString().padStart(6, "0")}`
      const itemsList = state.items
        .map((item) => `• ${item.quantity}x ${item.name} - ${formatCurrency(Number(item.price) * item.quantity)}`)
        .join("\n")

      const paymentMethodText = { dinheiro: "💵 Dinheiro", pix: "📱 PIX", cartao: "💳 Cartão" }

      const message = `🍔 *PEDIDO BADÃO GRILL & BURGUER*  
🆔 *Código do Pedido:* ${code}

👤 *Cliente:* ${customerName}
📞 *Telefone:* ${customerPhone}

📋 *Itens do Pedido:*
${itemsList}

💰 *Total:* ${formatCurrency(total)}
💳 *Forma de Pagamento:* ${paymentMethodText[paymentMethod]}

${observations ? `📝 *Observações:* ${observations}` : ""}

---
_Pedido realizado através do site Badão Grill & Burguer_
_"O Melhor tem Nome"_`

      const encodedMessage = encodeURIComponent(message)
      const whatsappNumber = "5511967701575"
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

      window.open(whatsappUrl, "_blank")
      dispatch({ type: "CLEAR_CART" })
      toast.success("Pedido enviado com sucesso! Redirecionando para o WhatsApp...", { id: toastId })
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao enviar pedido. Tente novamente.", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Dados do Cliente
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

      {/* Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Forma de Pagamento
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
                <Smartphone className="h-4 w-4" /> PIX (Recomendado)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dinheiro" id="dinheiro" />
              <Label htmlFor="dinheiro" className="flex items-center gap-2 cursor-pointer">
                <Banknote className="h-4 w-4" /> Dinheiro
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cartao" id="cartao" />
              <Label htmlFor="cartao" className="flex items-center gap-2 cursor-pointer">
                <CreditCard className="h-4 w-4" /> Cartão (Débito/Crédito)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Observações */}
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

      {/* Resumo do Pedido */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(total)}</span>
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
