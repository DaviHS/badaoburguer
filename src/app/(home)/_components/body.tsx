"use client"

import { Hero } from "@/components/home/hero"
import { 
  Header, 
  ProductGrid, 
  Cart, 
  Footer
} from "@/components/home/index"

export const Body = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-8">
        <ProductGrid />
      </main>
      <Footer />
      <Cart />
    </div>
  )
}
