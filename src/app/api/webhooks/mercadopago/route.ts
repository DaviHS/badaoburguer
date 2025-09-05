import { NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db"
import { orders } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Webhook recebido:", body)

    if (body.type === "payment") {
      const paymentId = body.data.id
      
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      )

      if (!paymentResponse.ok) {
        throw new Error("Falha ao buscar dados do pagamento")
      }

      const paymentData = await paymentResponse.json()
      console.log("Dados do pagamento:", paymentData)

      const orderId = parseInt(paymentData.external_reference || "0")
      const status = paymentData.status

      if (orderId && orderId > 0) {
        await db.update(orders)
          .set({
            paymentId: paymentId.toString(),
            paymentStatus: status,
            updatedAt: new Date(),
          })
          .where(eq(orders.orderId, orderId))

        console.log(`Pedido ${orderId} atualizado para status: ${status}`)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    )
  }
}