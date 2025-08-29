import { Clock, CheckCircle, Truck, Package, Ban } from "lucide-react"
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
    case 0: // Pendente
      return { 
        label: "Pendente", 
        variant: "destructive", 
        icon: <Clock className="h-4 w-4" />, 
        bgColor: "bg-red-100", 
        iconColor: "text-red-600" 
      }
    case 1: // Pago
      return { 
        label: "Pago", 
        variant: "secondary", 
        icon: <Package className="h-4 w-4" />, 
        bgColor: "bg-blue-100", 
        iconColor: "text-blue-600" 
      }
    case 2: // Enviado
      return { 
        label: "Enviado", 
        variant: "default", 
        icon: <Truck className="h-4 w-4" />, 
        bgColor: "bg-yellow-100", 
        iconColor: "text-yellow-600" 
      }
    case 3: // Entregue
      return { 
        label: "Entregue", 
        variant: "default", 
        icon: <CheckCircle className="h-4 w-4 text-white" />, 
        bgColor: "bg-green-600", 
        iconColor: "text-white" 
      }
    case 4: // Cancelado
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
        icon: null, 
        bgColor: "bg-gray-100", 
        iconColor: "text-gray-600" 
      }
  }
}

export const translateStatusName = (statusName: string): string => {
  switch (statusName) {
    case "Pending":
      return "Pendente"
    case "Paid":
      return "Pago"
    case "Shipped":
      return "Enviado"
    case "Delivered":
      return "Entregue"
    case "Cancelled":
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
