"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/contexts/cart-context"
import { MessageCircle, User, CreditCard, Banknote, Smartphone, Loader2, QrCode, CheckCircle, XCircle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils/price"
import { toast } from "sonner"
import { PaymentStatus } from "@/types/order"

interface CheckoutFormProps {
  onClose: () => void
}

interface PixPaymentData {
  qrCode: string
  qrCodeBase64: string
  transactionId: string
  expirationDate: string
}

export function CheckoutForm({ onClose }: CheckoutFormProps) {
  const { data: session } = useSession()
  const { state, dispatch } = useCart()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix" | "cartao">("pix")
  const [observations, setObservations] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pixData, setPixData] = useState<PixPaymentData | null>(null)
  const [isPixGenerated, setIsPixGenerated] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)

  const createOrder = api.order.create.useMutation()
  const createPayment = api.payment.create.useMutation()
  const total = state.items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)

  const { data: paymentStatusData, refetch: refetchPaymentStatus } = api.payment.checkStatus.useQuery(
    { orderId: currentOrderId! },
    {
      enabled: !!currentOrderId && (paymentMethod === 'pix' || paymentMethod === 'cartao'),
      refetchInterval: 10000, 
    }
  )

  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.fullName || "")
      setCustomerPhone(session.user.phone || "")
    }
  }, [session])

  useEffect(() => {
    if (paymentStatusData) {
      setPaymentStatus(paymentStatusData)
      
      if (paymentStatusData === 'approved') {
        toast.success("Pagamento confirmado!")
      } else if (paymentStatusData === 'rejected' || paymentStatusData === 'cancelled') {
        toast.error("Pagamento recusado ou cancelado.")
      }
    }
  }, [paymentStatusData])

  const sendWhatsAppNotification = async (orderId: number, paymentMethod: string, additionalInfo = "") => {
    const code = `BADAO-${orderId.toString().padStart(6, "0")}`
    const itemsList = state.items
      .map((item) => `• ${item.quantity}x ${item.name} - ${formatCurrency(Number(item.price) * item.quantity)}`)
      .join("\n")

    const paymentMethodText = { 
      dinheiro: "💵 Dinheiro", 
      pix: "📱 PIX", 
      cartao: "💳 Cartão" 
    }

    const statusText = {
      pending: "⏳ *Status:* Aguardando pagamento",
      approved: "✅ *Status:* Pagamento confirmado",
      rejected: "❌ *Status:* Pagamento recusado",
      in_process: "🔄 *Status:* Processando pagamento",
      cancelled: "🚫 *Status:* Pagamento cancelado"
    }

    const message = `🍔 *PEDIDO BADÃO GRILL & BURGUER*  
🆔 *Código do Pedido:* ${code}

👤 *Cliente:* ${customerName}
📞 *Telefone:* ${customerPhone}

📋 *Itens do Pedido:*
${itemsList}

💰 *Total:* ${formatCurrency(total)}
💳 *Forma de Pagamento:* ${paymentMethodText[paymentMethod as keyof typeof paymentMethodText]}
${paymentStatus ? statusText[paymentStatus] : ""}
${additionalInfo}

${observations ? `📝 *Observações:* ${observations}` : ""}

---
_Pedido realizado através do site Badão Grill & Burguer_
_"O Melhor tem Nome"_`

    const encodedMessage = encodeURIComponent(message)
    const whatsappNumber = "5511967701575"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    return whatsappUrl
  }

  const handlePixPayment = async () => {
    setIsSubmitting(true)
    const toastId = toast.loading("Criando pedido PIX...")

    try {
      const { orderId } = await createOrder.mutateAsync({
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: "pix",
        observations,
        total: total.toString()
      })

      setCurrentOrderId(orderId)
      setPaymentStatus('pending')

      const result = await createPayment.mutateAsync({
        orderId,
        amount: total,
        description: `Pedido #${orderId} - Badão Grill & Burguer`,
        paymentMethod: "pix"
      })

      await sendWhatsAppNotification(
        orderId, 
        "pix", 
        `🔗 *Link PIX:* ${result.qrCode || "Código disponível no site"}`
      )

      setPixData({
        qrCode: result.qrCode || "",
        qrCodeBase64: result.qrCodeBase64 || "",
        transactionId: result.transactionId || "",
        expirationDate: result.expirationDate || new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      setIsPixGenerated(true)

      dispatch({ type: "CLEAR_CART" })
      toast.success("QR Code PIX gerado com sucesso! Notificação enviada para WhatsApp.", { id: toastId })

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Erro ao gerar PIX", { id: toastId })
      setIsSubmitting(false)
    }
  }

  const handleCardPayment = async () => {
    setIsSubmitting(true)
    const toastId = toast.loading("Criando pedido...")

    try {
      const { orderId } = await createOrder.mutateAsync({
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: "cartao",
        observations,
        total: total.toString()
      })

      setCurrentOrderId(orderId)
      setPaymentStatus('pending')

      await sendWhatsAppNotification(orderId, "cartao", "💳 *Pagamento via Cartão (Mercado Pago)*")

      const { paymentUrl } = await createPayment.mutateAsync({
        orderId,
        amount: total,
        description: `Pedido #${orderId} - Badão Grill & Burguer`,
        paymentMethod: "card"
      })

      if (paymentUrl) {
        dispatch({ type: "CLEAR_CART" })
        toast.success("Pedido criado! Redirecionando para pagamento...", { id: toastId })
        window.location.href = paymentUrl
      } else {
        throw new Error("URL de pagamento não gerada")
      }

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Erro ao processar pagamento", { id: toastId })
      setIsSubmitting(false)
    }
  }

  const handleWhatsAppOrder = async () => {
    setIsSubmitting(true)
    const toastId = toast.loading("Enviando pedido...")

    try {
      const { orderId } = await createOrder.mutateAsync({
        items: state.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        observations,
        total: total.toString()
      })

      setCurrentOrderId(orderId)
      setPaymentStatus('approved') 

      await sendWhatsAppNotification(orderId, paymentMethod)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName?.trim() || !customerPhone?.trim()) {
      toast.error("Preencha seu nome e telefone antes de continuar.")
      return
    }

    if (state.items.length === 0) {
      toast.error("O carrinho está vazio.")
      return
    }

    if (paymentMethod === "cartao") {
      await handleCardPayment()
    } else if (paymentMethod === "pix") {
      await handlePixPayment()
    } else {
      await handleWhatsAppOrder()
    }
  }

  const handleCopyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode)
      toast.success("Código PIX copiado!")
    }
  }

  const handleNewOrder = () => {
    setPixData(null)
    setIsPixGenerated(false)
    setPaymentStatus(null)
    setCurrentOrderId(null)
    onClose()
  }

  const renderPaymentStatusIcon = () => {
    switch (paymentStatus) {
      case 'approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'rejected':
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'in_process':
        return <Clock className="h-6 w-6 text-yellow-500" />
      default:
        return <Clock className="h-6 w-6 text-blue-500" />
    }
  }

  const renderPaymentStatusText = () => {
    switch (paymentStatus) {
      case 'approved':
        return "Pagamento confirmado!"
      case 'rejected':
        return "Pagamento recusado."
      case 'cancelled':
        return "Pagamento cancelado."
      case 'in_process':
        return "Processando pagamento..."
      default:
        return "Aguardando pagamento..."
    }
  }

  if (!session?.user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center text-center min-h-[200px]">
          <p className="text-base mb-3">Para finalizar seu pedido, faça login ou cadastro.</p>
          <Button onClick={() => (window.location.href = "/sign-in")}>
            Login / Cadastro
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isPixGenerated && pixData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <QrCode className="h-6 w-6" /> Pagamento PIX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 mx-auto max-w-xs">
              <img 
                src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                alt="QR Code PIX" 
                className="w-full h-auto mx-auto"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code com seu app bancário ou copie o código abaixo:
              </p>
              
              <div className="bg-muted p-3 rounded-lg break-all text-xs font-mono">
                {pixData.qrCode}
              </div>
              
              <Button onClick={handleCopyPixCode} size="sm" variant="outline">
                Copiar Código PIX
              </Button>
            </div>

            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              ⏰ Válido até: {new Date(pixData.expirationDate).toLocaleString('pt-BR')}
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
              {renderPaymentStatusIcon()}
              <span>{renderPaymentStatusText()}</span>
            </div>

            <Button onClick={handleNewOrder} className="w-full">
              Fazer Novo Pedido
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}>
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
                <CreditCard className="h-4 w-4" /> Cartão (Mercado Pago)
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "cartao" && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Você será redirecionado para o Mercado Pago. O pedido já será enviado para nosso WhatsApp.
              </p>
            </div>
          )}
          
          {paymentMethod === "pix" && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                💡 O pedido será enviado para nosso WhatsApp e você receberá o QR Code PIX para pagamento.
              </p>
            </div>
          )}
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
        {isSubmitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : paymentMethod === "cartao" ? (
          <CreditCard className="h-5 w-5" />
        ) : paymentMethod === "pix" ? (
          <QrCode className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        {isSubmitting ? "Processando..." : 
         paymentMethod === "cartao" ? "Pagar com Cartão" : 
         paymentMethod === "pix" ? "Gerar PIX" : "Enviar Pedido via WhatsApp"}
      </Button>
    </div>
  )
}