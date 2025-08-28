"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CheckoutForm } from "./checkout-form"
import { useCart } from "@/lib/cart-context"
import { ShoppingCart, Plus, Minus, Trash2, X, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils/price"

export default function Cart({ trigger }: { trigger?: React.ReactNode }) {
  const { state, dispatch } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } })
  }

  const removeItem = (productId: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const handleCheckoutClose = () => {
    setShowCheckout(false)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}

      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {showCheckout ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span>Finalizar Pedido</span>
              </div>
            ) : (
              <>
                <span>Carrinho de Compras</span>
                {state.items.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {showCheckout ? (
            <div className="flex-1 overflow-y-auto py-4">
              <CheckoutForm onClose={handleCheckoutClose} />
            </div>
          ) : state.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Seu carrinho está vazio</p>
                <p className="text-sm text-muted-foreground mt-2">Adicione alguns produtos deliciosos!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {state.items.map((item) => (
                  <Card key={item.productId}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={item.photos?.[0]?.url || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                            sizes="64px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          <p className="text-primary font-bold">{formatCurrency(item.price)}</p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(state.total)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={() => setShowCheckout(true)}>
                  Finalizar Pedido
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
