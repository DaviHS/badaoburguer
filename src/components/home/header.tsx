"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Menu, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Image from "next/image"
import Cart from "./cart"

export default function Header() {
  const { state } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-gradient-to-r from-[#6a1b40] to-[#4d0f2e] shadow-lg"
          : "bg-gradient-to-r from-[#4d0f2e] to-[#6a1b40] shadow-md"
      } text-white border-b border-[#3a0b20]`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner transition-all duration-500">
              <Image
                src="/logo-circle-white.png"
                alt="Logo"
                width={32}
                height={32}
                className="object-contain border-0 outline-none"
              />
            </div>
            <div className="block">
              <h2 className="font-playfair font-bold text-xl text-white">Badão Grill & Burguer</h2>
              <p className="text-xs text-yellow-500">O Melhor tem Nome</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white hover:text-yellow-400 transition-colors">Início</a>
            <a href="#produtos" className="text-white hover:text-yellow-400 transition-colors">Produtos</a>
            <a href="/admin" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">Admin</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Cart
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="relative bg-transparent border-white text-white hover:bg-white hover:text-[#4d0f2e] transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-yellow-400 text-[#4d0f2e]">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              }
            />
            <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#3a0b20]">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Início</a>
              <a href="#produtos" className="text-white hover:text-yellow-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Produtos</a>
              <a href="/admin" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm" onClick={() => setIsMenuOpen(false)}>Admin</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
