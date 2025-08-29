"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Search, Edit, Trash2, Plus, Eye, EyeOff, User } from "lucide-react"
import { toast } from "sonner"
import { UserForm } from "@/types"
import { LoadingSkeleton } from "@/components/shared/loading"
import { Label } from "../ui/label"
import { formatCPF, formatPhone } from "@/lib/utils/format"

export function UserManagement() {
  const { data: usersData, refetch, isLoading: usersLoading } = api.user.list.useQuery()
  const { data: rolesData, isLoading: rolesLoading } = api.userRoles.list.useQuery()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserForm & { userId?: number } | null>(null)
  const [newUser, setNewUser] = useState<UserForm>({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    roleId: rolesData?.[0]?.roleId ?? 3,
    password: "",
  })

  const createUserMutation = api.user.create.useMutation()
  const updateUserMutation = api.user.update.useMutation()
  const deleteUserMutation = api.user.delete.useMutation()

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "-")

  const filteredUsers = usersData?.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cpf ?? "").includes(searchTerm)

    const matchesRole =
      filterRole === "all" ||
      user!.roleId!.toString() === filterRole

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.status === 1) ||
      (filterStatus === "inactive" && user.status === 0)

    return matchesSearch && matchesRole && matchesStatus
  }) ?? []

  const toggleUserStatus = async (userId: number, currentStatus: number) => {
    const user = usersData?.find((u) => u.userId === userId)
    if (!user) return

    const toastId = toast.loading("Atualizando status...")
    try {
      await updateUserMutation.mutateAsync({
        userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? undefined,
        cpf: user.cpf ?? undefined,
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : undefined,
        status: currentStatus === 1 ? 0 : 1,
        roleId: user.roleId ?? 3,
      })
      toast.success("Status do usuário atualizado!", { id: toastId })
      refetch()
    } catch {
      toast.error("Falha ao atualizar status.", { id: toastId })
    }
  }

  const handleEditUser = (user: NonNullable<typeof usersData>[number]) => {
    setEditingUser({
      userId: user.userId,
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      cpf: user.cpf ?? "",
      birthDate: user.birthDate ? String(new Date(user.birthDate).toISOString().split("T")[0]) : "",
      roleId: user.roleId ?? 3,
      password: "",
    })
    setIsAddUserOpen(true)
  }

  const addUserOrEdit = async () => {
    const userData = editingUser || newUser

    if (!userData.fullName || !userData.email || (!editingUser && !userData.password)) {
      alert("Por favor, preencha os campos obrigatórios (Nome, Email e Senha)")
      return
    }

    const roleIdSafe = userData.roleId ?? rolesData?.[0]?.roleId ?? 3
    const toastId = toast.loading(editingUser ? "Atualizando usuário..." : "Criando usuário...")

    try {
      if (editingUser?.userId) {
        await updateUserMutation.mutateAsync({
          userId: editingUser.userId,
          fullName: editingUser.fullName,
          email: editingUser.email,
          phone: editingUser.phone || undefined,
          cpf: editingUser.cpf || undefined,
          birthDate: editingUser.birthDate || undefined,
          roleId: roleIdSafe,
          status: 1,
          ...(editingUser.password ? { password: editingUser.password } : {}),
        })
        toast.success("Usuário atualizado com sucesso!", { id: toastId })
      } else {
        await createUserMutation.mutateAsync({
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone || undefined,
          cpf: userData.cpf || undefined,
          birthDate: userData.birthDate || undefined,
          password: userData.password,
          roleId: roleIdSafe,
          status: 1,
        })
        toast.success("Usuário criado com sucesso!", { id: toastId })
      }

      refetch()
      setEditingUser(null)
      setNewUser({ fullName: "", email: "", phone: "", cpf: "", birthDate: "", roleId: rolesData?.[0]?.roleId ?? 3, password: "" })
      setIsAddUserOpen(false)
    } catch {
      toast.error("Falha ao salvar usuário.", { id: toastId })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    const toastId = toast.loading("Excluindo usuário...")
    try {
      await deleteUserMutation.mutateAsync({ userId })
      toast.success("Usuário excluído com sucesso!", { id: toastId })
      refetch()
    } catch {
      toast.error("Falha ao excluir usuário.", { id: toastId })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-playfair text-2xl">Gerenciamento de Usuários</CardTitle>
              <CardDescription>Visualize e gerencie todos os usuários cadastrados no sistema</CardDescription>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  {editingUser ? "Editar Usuário" : "Adicionar Usuário"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                <DialogHeader> 
                  <DialogTitle className="flex items-center gap-2"> 
                    <User className="h-5 w-5" /> {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"} 
                  </DialogTitle> 
                  <DialogDescription> 
                    Preencha os dados do usuário. Campos com * são obrigatórios. 
                  </DialogDescription> 
                </DialogHeader> 
                <div className="grid gap-4 py-4"> 
                  <div className="grid gap-2"> 
                    <Label htmlFor="name">Nome Completo *</Label> 
                    <Input 
                      id="name" 
                      value={(editingUser || newUser).fullName} 
                      onChange={(e) => editingUser ? 
                        setEditingUser({ ...editingUser, fullName: e.target.value }) : 
                        setNewUser({ ...newUser, fullName: e.target.value }) 
                      } 
                      placeholder="Digite o nome completo" 
                    /> 
                  </div> 
                <div className="grid gap-2"> 
                  <Label htmlFor="email">Email *</Label> 
                  <Input 
                    id="email" 
                    type="email" 
                    value={(editingUser || newUser).email} 
                    onChange={(e) => editingUser ? 
                      setEditingUser({ ...editingUser, email: e.target.value }) : 
                      setNewUser({ ...newUser, email: e.target.value }) 
                    } placeholder="Digite o email" 
                  /> 
                </div> 
                <div className="grid gap-2"> 
                  <Label htmlFor="phone">Telefone</Label> 
                  <Input 
                    id="phone" 
                    value={(editingUser || newUser).phone} 
                    onChange={(e) => editingUser ? 
                      setEditingUser({ ...editingUser, phone: formatPhone(e.target.value) }) : 
                      setNewUser({ ...newUser, phone: formatPhone(e.target.value) }) 
                    } 
                    placeholder="(11) 99999-9999" 
                    maxLength={15} 
                  /> 
                </div> 
                <div className="grid gap-2"> 
                  <Label htmlFor="cpf">CPF</Label> 
                  <Input 
                    id="cpf" 
                    value={(editingUser || newUser).cpf} 
                    onChange={(e) => editingUser ? 
                      setEditingUser({ ...editingUser, cpf: formatCPF(e.target.value) }) : 
                      setNewUser({ ...newUser, cpf: formatCPF(e.target.value) }) 
                    } 
                    placeholder="123.456.789-00"
                    maxLength={14} 
                  /> 
                </div> 
                <div className="grid gap-2"> 
                  <Label htmlFor="birthDate">Data de Nascimento</Label> 
                  <Input 
                    id="birthDate" 
                    type="date"
                    value={(editingUser || newUser).birthDate} 
                    onChange={(e) => editingUser ? 
                      setEditingUser({ ...editingUser, birthDate: e.target.value }) : 
                      setNewUser({ ...newUser, birthDate: e.target.value }) 
                    } 
                  /> 
                  </div> 
                  <div className="grid gap-2"> 
                    <Label htmlFor="type">Tipo de Usuário</Label> 
                    <Select 
                      value={String((editingUser || newUser).roleId)} 
                      onValueChange={(value) => editingUser ? 
                        setEditingUser({ ...editingUser, roleId: Number(value) }) : 
                        setNewUser({ ...newUser, roleId: Number(value) }) } 
                      > 
                      <SelectTrigger> 
                        <SelectValue /> 
                      </SelectTrigger> 
                      <SelectContent> 
                        {rolesData?.map((role) => ( 
                          <SelectItem key={role.roleId} value={role.roleId.toString()}> 
                            {role.name} 
                          </SelectItem> 
                        ))} 
                      </SelectContent> 
                    </Select> 
                  </div> 
                  <div className="grid gap-2"> 
                    <Label htmlFor="password">{editingUser ? "Nova Senha" : "Senha *"}</Label> 
                    <Input 
                      id="password" 
                      type="password" 
                      value={(editingUser || newUser).password} 
                      onChange={(e) => editingUser ? 
                        setEditingUser({ ...editingUser, password: e.target.value }) : 
                        setNewUser({ ...newUser, password: e.target.value }) 
                      } 
                      placeholder={editingUser ? "Deixe vazio para não alterar" : "Digite a senha"} 
                    /> 
                  </div> 
                  </div> 
                  <DialogFooter> 
                    <Button variant="outline" onClick={() => { setIsAddUserOpen(false); setEditingUser(null); }}> 
                      Cancelar 
                    </Button> 
                    <Button onClick={addUserOrEdit} className="bg-primary hover:bg-primary/90"> 
                      {editingUser ? "Salvar Alterações" : "Adicionar Usuário"} 
                    </Button>
                   </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {(usersLoading || rolesLoading) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <> 
              <div className="flex flex-col sm:flex-row gap-4 mb-6"> 
                <div className="relative flex-1"> 
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" /> 
                  <Input placeholder="Buscar por nome, email ou CPF..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" 
                  /> 
                </div> 
                <Select value={filterRole} onValueChange={setFilterRole}> 
                  <SelectTrigger className="w-full sm:w-[180px]"> 
                    <SelectValue placeholder="Tipo de usuário" /> 
                  </SelectTrigger> 
                  <SelectContent> 
                    <SelectItem value="all">Todos os tipos</SelectItem> 
                    {rolesData?.map((role) => ( 
                      <SelectItem 
                        key={role.roleId} 
                        value={role.roleId.toString()}
                      > 
                        {role.name}
                      </SelectItem> 
                    ))} 
                  </SelectContent> 
                </Select> 
                <Select 
                  value={filterStatus} 
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-full sm:w-[180px]"> 
                    <SelectValue placeholder="Status" /> 
                  </SelectTrigger> 
                  <SelectContent> 
                    <SelectItem value="all">Todos os status</SelectItem> 
                    <SelectItem value="active">Ativos</SelectItem> 
                    <SelectItem value="inactive">Inativos</SelectItem> 
                  </SelectContent> 
                </Select> 
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.userId} className="flex flex-col justify-between h-full">
                    <CardHeader className="pb-2 flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg truncate">{user.fullName}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">ID: {user.userId}</CardDescription>
                      </div>
                      <Badge variant="default">{rolesData?.find((r) => r.roleId === user.roleId)?.name ?? "Role"}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm flex-1">
                      <p>📧 {user.email}</p>
                      <p>📞 {user.phone ?? "-"}</p>
                      <p>🪪 {user.cpf ?? "-"}</p>
                      <p>📅 {user.createdAt ? formatDate(user.createdAt.toISOString()) : "-"}</p>
                    </CardContent>

                    <div className="flex items-center justify-between gap-2 p-4 pt-0">
                      <Badge variant={user.status === 1 ? "default" : "destructive"}>{user.status === 1 ? "Ativo" : "Inativo"}</Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(user.userId, user!.status!)} className="h-8 w-8 p-0">
                          {user.status === 1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o usuário "{user.fullName}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex gap-2">
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.userId)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</div>}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
