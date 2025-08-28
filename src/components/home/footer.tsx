import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-[#4d0f2e] text-white border-t border-[#6a1b40]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="font-playfair text-2xl font-bold text-foreground text-gray-300">Badão Grill & Burguer</h3>
              <p className="text-primary font-semibold">O Melhor tem Nome</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Hambúrgueres e espetos crus de qualidade premium para você preparar em casa. Sabor autêntico e
              ingredientes selecionados.
            </p>
            {/* <div className="flex gap-3">
              <Button size="sm" variant="outline" className="p-2 bg-transparent">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="p-2 bg-transparent">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="p-2 bg-transparent">
                <Mail className="w-4 h-4" />
              </Button>
            </div> */}
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Nossos Produtos</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Hambúrgueres Premium
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Espetos Temperados
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Pronta Entrega
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Encomendas
                </a>
              </li>
            </ul>
          </div>

          {/* <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">(11) 99999-9999</p>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">contato@badaoburguer.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground">São Paulo, SP</p>
                  <p className="text-xs text-muted-foreground">Entregamos em toda região</p>
                </div>
              </div>
            </div>
          </div> */}

          {/* Horários */}
          {/* <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Funcionamento</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Atendimento</span>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p>Segunda a Sexta: 9h às 18h</p>
                <p>Sábado: 9h às 16h</p>
                <p>Domingo: 10h às 14h</p>
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-xs text-primary font-medium">
                  🔥 Pedidos pelo WhatsApp até 17h para entrega no mesmo dia
                </p>
              </div>
            </div>
          </div> */}
        </div>

        <div className="border-t border-[#6a1b40] mt-12 pt-8 text-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2025 Badão Grill & Burguer. Todos os direitos reservados.</p>
            {/* <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Termos de Uso
              </a>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  )
}
