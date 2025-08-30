import { Header, Footer } from "@/components/home"
import { OrderHistory } from "@/components/user/order-history"

export default function OrderaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pedidos</h1>
            <p className="text-muted-foreground">Acompanhe o histórico e status dos seus pedidos</p>
          </div>
          <OrderHistory />
        </div>
      </main>
      <Footer />
    </div>
  )
}
