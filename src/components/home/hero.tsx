import { Badge } from "@/components/ui/badge"
import { Flame, Clock, Star } from "lucide-react"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-[#4d0f2e] via-[#6a1b40] to-yellow-50 py-10 md:py-15 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 shadow-sm flex items-center gap-2 uppercase tracking-wide font-semibold"
              >
                <Flame className="w-4 h-4 animate-pulse" />
                Qualidade Premium
              </Badge>

              <h1 className="font-playfair text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
                Badão Grill
                <span className="text-yellow-500 block"> & Burguer</span>
              </h1>

              <p className="text-2xl md:text-3xl font-semibold text-primary drop-shadow-md">
                O Melhor tem Nome
              </p>

              <p className="text-lg text-gray-100 max-w-lg leading-relaxed drop-shadow">
                Hambúrgueres e espetos crus de qualidade premium para você preparar em casa. Sabor autêntico,
                ingredientes selecionados, experiência gastronômica única.
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span>Pronta entrega e encomendas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-100">
                <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span>Ingredientes premium</span>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="#produtos"
                className="inline-block px-8 py-3 font-semibold rounded-full bg-yellow-400 text-[#4d0f2e] shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300"
              >
                Ver Produtos
              </a>
            </div>
          </div>

          {/* <div className="relative flex justify-center items-center">
            <div className="w-full h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <Image
                src="/hero-burger.png"
                alt="Hambúrguer Premium"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#4d0f2e]/60 via-transparent to-transparent"></div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  )
}
