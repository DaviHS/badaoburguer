"use client"

import { RegisterForm } from "@/components/user/register-form"
import { Header } from "@/components/home"
import { Footer } from "@/components/home"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4x1">
          <RegisterForm />
        </div>
      </div>

      <Footer />
    </div>
  )
}
