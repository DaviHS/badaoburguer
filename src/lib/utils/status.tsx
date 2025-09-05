import { Clock, CheckCircle, Truck, Package, Ban, HelpCircle, ChefHat, CreditCard } from "lucide-react"
import { ReactNode } from "react"

export type StatusInfo = {
  label: string
  variant: "default" | "destructive" | "secondary" | "outline"
  icon: ReactNode | null
  iconColor?: string
  bgColor?: string
}

export const getStatusInfo = (statusId: number | null): StatusInfo => {
  switch (statusId) {
    case 0:
      return { 
        label: "Pendente", 
        variant: "destructive", 
        icon: <Clock className="h-4 w-4" />, 
        bgColor: "bg-red-100", 
        iconColor: "text-red-600" 
      }
    case 1:
      return { 
        label: "Pago", 
        variant: "secondary", 
        icon: <CreditCard className="h-4 w-4" />, 
        bgColor: "bg-blue-100", 
        iconColor: "text-blue-600" 
      }
    case 2:
      return { 
        label: "Preparando", 
        variant: "default", 
        icon: <ChefHat className="h-4 w-4" />, 
        bgColor: "bg-yellow-100", 
        iconColor: "text-yellow-600" 
      }
    case 3: 
      return { 
        label: "Pronto", 
        variant: "default", 
        icon: <Package className="h-4 w-4" />, 
        bgColor: "bg-orange-100", 
        iconColor: "text-orange-600" 
      }
    case 4: 
      return { 
        label: "Saiu para Entrega", 
        variant: "default", 
        icon: <Truck className="h-4 w-4" />, 
        bgColor: "bg-purple-100", 
        iconColor: "text-purple-600" 
      }
    case 5: 
      return { 
        label: "Entregue", 
        variant: "default", 
        icon: <CheckCircle className="h-4 w-4" />, 
        bgColor: "bg-green-100", 
        iconColor: "text-green-600" 
      }
    case 6: 
      return { 
        label: "Cancelado", 
        variant: "destructive", 
        icon: <Ban className="h-4 w-4" />, 
        bgColor: "bg-red-100", 
        iconColor: "text-red-600" 
      }
    default:
      return { 
        label: "Desconhecido", 
        variant: "outline", 
        icon: <HelpCircle className="h-4 w-4" />, 
        bgColor: "bg-gray-100", 
        iconColor: "text-gray-600" 
      }
  }
};

export const translateStatusName = (statusName: string): string => {
  switch (statusName) {
    case "pending":
      return "Pendente"
    case "paid":
      return "Pago"
    case "preparing":
      return "Preparando"
    case "ready":
      return "Pronto"
    case "delivering":
      return "Saiu para Entrega"
    case "delivered":
      return "Entregue"
    case "cancelled":
      return "Cancelado"
    default:
      return statusName
  }
}

export const getStockStatus = (stock: number) => {
  if (stock === 0) {
    return { label: "Sem estoque", bg: "bg-red-100", text: "text-red-600" }
  }
  if (stock <= 5) {
    return { label: "Baixo", bg: "bg-yellow-100", text: "text-yellow-700" }
  }
  return { label: "Normal", bg: "bg-green-100", text: "text-green-700" }
}
