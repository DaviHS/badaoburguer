// utils/test-mp-connection.ts
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function testMercadoPagoConnection() {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    })

    const preference = new Preference(client)
    
    // Teste simples
    const result = await preference.create({
      body: {
        items: [
          {
            id: "test-1",
            title: "Teste de Conexão",
            quantity: 1,
            unit_price: 10,
            currency_id: "BRL",
          }
        ],
      },
    })

    console.log("✅ Conexão com Mercado Pago bem-sucedida!")
    console.log("Preference ID:", result.id)
    return true
    
  } catch (error: any) {
    console.error("❌ Erro na conexão com Mercado Pago:")
    console.error("Mensagem:", error.message)
    
    if (error.response) {
      console.error("Status:", error.response.status)
      console.error("Data:", error.response.data)
    }
    
    return false
  }
}