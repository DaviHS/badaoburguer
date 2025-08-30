"use client"

import { Header } from "@/components/home"
import { Footer } from "@/components/home"
import { AccountInfo } from "@/components/user/account-info"

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground mb-2">Minha Conta</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências de forma segura.
            </p>
          </div>
          <AccountInfo />
        </div>
      </main>
      <Footer />
    </div>
  )
}
