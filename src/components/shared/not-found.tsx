"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { PageContent } from "../page"
import notFound from "@/assets/imagens/404.png"

export default function NotFoundPage() {
  return (
    <PageContent className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
      <motion.div
        className="relative h-92 w-80 sm:h-80 sm:w-80"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Image src={notFound} alt="404 Error" fill priority className="object-contain" />
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-center font-bold">
          Oops! A página solicitada não foi encontrada!
        </p>
        <p className="text-lg text-muted-foreground">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
        <Button asChild>
          <Link href="/">Voltar para a página inicial</Link>
        </Button>
      </motion.div>
    </PageContent>
  )
}
