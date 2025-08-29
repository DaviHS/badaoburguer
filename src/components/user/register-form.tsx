"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User, Mail, Phone, CreditCard, Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

const registerSchema = z.object({
  fullName: z.string().nonempty("Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(14, "Telefone inválido"),
  cpf: z.string().min(14, "CPF inválido"),
  birthDate: z.string().nonempty("Data de nascimento é obrigatória"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme a senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const mutation = api.user.create.useMutation()

  const formatPhone = (value: string) => {
    value = value.replace(/\D/g, "")
    if (value.length <= 10) {
      return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    } else {
      return value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
    }
  }

  const formatCPF = (value: string) => {
    value = value.replace(/\D/g, "")
    return value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setSuccess("")
    try {
      const { confirmPassword, ...payload } = data
      await mutation.mutateAsync({ ...payload, status: 1, roleId: 3 })
      setSuccess("Cadastro realizado com sucesso!")
      reset()
      setTimeout(() => router.push("/"), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Criar Conta</CardTitle>
        <CardDescription className="text-center text-gray-600">
          Preencha os dados abaixo para se cadastrar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="fullName" className="flex items-center gap-2"><User className="w-4 h-4" /> Nome Completo</Label>
            <Input {...register("fullName")} id="fullName" className="h-11" placeholder="Digite seu nome completo" />
            {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email</Label>
            <Input {...register("email")} id="email" type="email" className="h-11" placeholder="seu@email.com" />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" /> Telefone</Label>
            <Input
              id="phone"
              className="h-11"
              placeholder="(11) 99999-9999"
              maxLength={15}
              value={watch("phone") || ""}
              onChange={(e) => setValue("phone", formatPhone(e.target.value))}
            />
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> CPF</Label>
            <Input
              id="cpf"
              className="h-11"
              placeholder="000.000.000-00"
              maxLength={14}
              value={watch("cpf") || ""}
              onChange={(e) => setValue("cpf", formatCPF(e.target.value))}
            />
            {errors.cpf && <p className="text-red-600 text-sm">{errors.cpf.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data de Nascimento</Label>
            <Input {...register("birthDate")} id="birthDate" type="date" className="h-11" />
            {errors.birthDate && <p className="text-red-600 text-sm">{errors.birthDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input {...register("password")} id="password" type={showPassword ? "text" : "password"} className="h-11 pr-10" placeholder="Digite sua senha" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </Button>
            </div>
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input {...register("confirmPassword")} id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="h-11 pr-10" placeholder="Confirme sua senha" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          {success && (
            <div className="md:col-span-2">
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="md:col-span-2">
            <Button type="submit" className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Criar Conta"}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 md:col-span-2">
            Já tem uma conta?{" "}
            <a href="/sign-in" className="text-red-600 hover:text-red-700 font-medium">
              Fazer login
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
