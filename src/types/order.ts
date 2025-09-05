export interface OfflineOrder {
  offlineId: number
  items: Array<{
    productId: number
    quantity: number
  }>
  paymentMethod: 'dinheiro' | 'pix' | 'cartao'
  observations?: string
  total: string
  createdAt: string
}

export interface OrderItem {
  orderItemId: number
  productId: number
  quantity: number
  price: string
  productName: string
}

export interface Order {
  orderId: number
  userId: number
  total: string
  status: number
  paymentMethod: string
  observations?: string
  paymentId?: string
  paymentStatus: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  createdAt: Date
  updatedAt: Date
  statusName?: string
  items: OrderItem[]
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'in_process' | 'cancelled'