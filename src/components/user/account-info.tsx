"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Edit, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/trpc/react"
import { toast } from "sonner"
import { LoadingSkeleton } from "@/components/shared/loading"

export function AccountInfo() {
  const { data: session, update } = useSession()
  const userId = session?.user?.userId
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    cpf: "",
    status: 0,
  })
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

  const getUser = api.user.getById.useQuery({ userId: userId || 0 }, { enabled: !!userId })
  const updateUser = api.user.update.useMutation()
  const changePassword = api.user.changePassword.useMutation()

  useEffect(() => {
    if (getUser.data) {
      setFormData({
        fullName: getUser.data.fullName,
        email: getUser.data.email,
        phone: getUser.data.phone || "",
        birthDate: getUser.data.birthDate ? String(new Date(getUser.data.birthDate).toISOString().split("T")[0]) : "",
        cpf: getUser.data.cpf || "",
        status: getUser.data.status || 1,
      })
    }
  }, [getUser.data])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!userId) return
    const toastId = toast.loading("Atualizando dados...")
    try {
      const updated = await updateUser.mutateAsync({ userId, ...formData })
      await update({ ...session, user: { ...session.user, ...updated.user } })
      toast.success("Dados atualizados com sucesso!", { id: toastId })
      setIsEditing(false)
    } catch (err: any) {
      toast.error(err?.message || "Erro ao atualizar dados.", { id: toastId })
    }
  }

  const handleCancel = () => {
    if (getUser.data) {
      setFormData({
        fullName: getUser.data.fullName,
        email: getUser.data.email,
        phone: getUser.data.phone || "",
        birthDate: getUser.data.birthDate ? String(new Date(getUser.data.birthDate).toISOString().split("T")[0]) : "",
        cpf: getUser.data.cpf || "",
        status: getUser.data.status || 1,
      })
    }
    setIsEditing(false)
  }

  const handlePasswordSave = async () => {
    if (!userId) return
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem.")
      return
    }
    const toastId = toast.loading("Alterando senha...")
    try {
      await changePassword.mutateAsync({
        userId,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success("Senha alterada com sucesso!", { id: toastId })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordForm(false)
    } catch (err: any) {
      toast.error(err?.message || "Erro ao alterar senha.", { id: toastId })
    }
  }

  const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  if (!userId) return null

  if (getUser.isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-1/3 mb-2" />
            <LoadingSkeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-1/3 mb-2" />
            <LoadingSkeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <LoadingSkeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Dados Pessoais</CardTitle>
              <CardDescription>Gerencie suas informações de perfil</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" />Editar</Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="bg-blue-600 text-white hover:bg-blue-700"><Save className="h-4 w-4 mr-2" />Salvar</Button>
                <Button onClick={handleCancel} variant="outline" size="sm"><X className="h-4 w-4 mr-2" />Cancelar</Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label htmlFor="fullName">Nome Completo</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={!isEditing} /></div>
            <div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} /></div>
            <div className="space-y-2"><Label htmlFor="birthDate">Data de Nascimento</Label><Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} disabled={!isEditing} /></div>
            <div className="space-y-2"><Label>CPF</Label><Input value={formatCPF(formData.cpf)} disabled className="bg-muted" /></div>
            <div className="space-y-2"><Label>Status da Conta: </Label><Badge variant={formData.status === 1 ? "default" : "destructive"}>{formData.status === 1 ? "Ativa" : "Inativa"}</Badge></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Mantenha sua conta segura alterando sua senha regularmente</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Senha atual</h3>
                <p className="text-sm text-muted-foreground">
                  Última alteração na conta: {getUser.data?.updatedAt ? new Date(getUser.data.updatedAt).toLocaleDateString() : ""}
                </p>
              </div>
              <Button onClick={() => setShowPasswordForm(true)} variant="outline">Alterar Senha</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="currentPassword">Senha Atual</Label><Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} /></div>
              <div className="space-y-2"><Label htmlFor="newPassword">Nova Senha</Label><Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} /></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Confirmar Nova Senha</Label><Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} /></div>
              <div className="flex gap-2"><Button onClick={handlePasswordSave} className="bg-red-600 text-white hover:bg-red-700">Salvar Nova Senha</Button><Button onClick={() => setShowPasswordForm(false)} variant="outline">Cancelar</Button></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
