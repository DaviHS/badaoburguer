import { Footer } from "@/components/home"
import Header from "@/components/home/header"
import { AccountPage } from "@/components/user/account-page"

export default function ContaPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minha Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
        </div>
        <AccountPage />
      </main>
      <Footer/>
    </div>
  )
}
