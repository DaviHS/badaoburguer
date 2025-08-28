"use client"

import { useState } from "react"
import { api } from "@/trpc/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Edit, Trash2, Eye, EyeOff, Plus, User } from "lucide-react"

type UserForm = {
  fullName: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  type: number
  password: string
}

export function UserManagement() {
  const { data: usersData, refetch } = api.user.list.useQuery()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserForm & { userId?: number } | null>(null)

  const [newUser, setNewUser] = useState<UserForm>({
    fullName: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    type: 0,
    password: "",
  })

  const createUserMutation = api.user.create.useMutation({
    onSuccess: () => {
      refetch()
      setIsAddUserOpen(false)
      setNewUser({ fullName: "", email: "", phone: "", cpf: "", birthDate: "", type: 0, password: "" })
    },
  })

  const updateUserMutation = api.user.update.useMutation({
    onSuccess: () => {
      refetch()
      setEditingUser(null)
      setIsAddUserOpen(false)
    },
  })

  const deleteUserMutation = api.user.delete.useMutation({
    onSuccess: () => refetch(),
  })

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "-")

  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")

  const formatPhone = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")

  const filteredUsers = usersData?.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cpf ?? "").includes(searchTerm)

    const matchesType =
      filterType === "all" ||
      (filterType === "admin" && user.type === 1) ||
      (filterType === "client" && user.type === 0)

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.status === 1) ||
      (filterStatus === "inactive" && user.status === 0)

    return matchesSearch && matchesType && matchesStatus
  }) ?? []

  const addUserOrEdit = () => {
    const userData = editingUser || newUser

    if (!userData.fullName || !userData.email || (!editingUser && !userData.password)) {
      alert("Por favor, preencha os campos obrigatórios (Nome, Email e Senha)")
      return
    }

    if (editingUser?.userId) {
      updateUserMutation.mutate({
        userId: editingUser.userId,
        fullName: editingUser.fullName,
        email: editingUser.email,
        phone: editingUser.phone || undefined,
        cpf: editingUser.cpf || undefined,
        birthDate: editingUser.birthDate || undefined,
        type: editingUser.type,
        status: 1,
        ...(editingUser.password ? { password: editingUser.password } : {}),
      })
    } else {
      createUserMutation.mutate({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || undefined,
        cpf: userData.cpf || undefined,
        birthDate: userData.birthDate || undefined,
        password: userData.password,
        type: userData.type,
        status: 1,
      })
    }

    setEditingUser(null)
    setNewUser({ fullName: "", email: "", phone: "", cpf: "", birthDate: "", type: 0, password: "" })
    setIsAddUserOpen(false)
  }

  const toggleUserStatus = (userId: number, currentStatus: number) => {
    const user = usersData?.find((u) => u.userId === userId)
    if (!user) return

    updateUserMutation.mutate({
      userId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? undefined,
      cpf: user.cpf ?? undefined,
      birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : undefined,
      status: currentStatus === 1 ? 0 : 1,
      type: user.type ?? undefined,
    })
  }

  const deleteUser = (userId: number) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      deleteUserMutation.mutate({ userId })
    }
  }

  type UserItem = NonNullable<typeof usersData>[number]

  const handleEditUser = (user: UserItem) => {
    setEditingUser({
      userId: user.userId,
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      cpf: user.cpf ?? "",
      birthDate: user.birthDate ? String(new Date(user.birthDate).toISOString().split("T")[0]) : "",
      type: user.type ?? 0,
      password: "",
    })
    setIsAddUserOpen(true)
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
                    <User className="h-5 w-5" />
                    {editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}
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
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, fullName: e.target.value })
                          : setNewUser({ ...newUser, fullName: e.target.value })
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
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, email: e.target.value })
                          : setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Digite o email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={(editingUser || newUser).phone}
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, phone: formatPhone(e.target.value) })
                          : setNewUser({ ...newUser, phone: formatPhone(e.target.value) })
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
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, cpf: formatCPF(e.target.value) })
                          : setNewUser({ ...newUser, cpf: formatCPF(e.target.value) })
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
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, birthDate: e.target.value })
                          : setNewUser({ ...newUser, birthDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de Usuário</Label>
                    <Select
                      value={String((editingUser || newUser).type)}
                      onValueChange={(value) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, type: Number(value) })
                          : setNewUser({ ...newUser, type: Number(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Cliente</SelectItem>
                        <SelectItem value="1">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{editingUser ? "Nova Senha" : "Senha *"}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={(editingUser || newUser).password}
                      onChange={(e) =>
                        editingUser
                          ? setEditingUser({ ...editingUser, password: e.target.value })
                          : setNewUser({ ...newUser, password: e.target.value })
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{usersData?.length ?? 0}</div>
                <p className="text-xs text-muted-foreground">Total de usuários</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{usersData?.filter((u) => u.status === 1).length ?? 0}</div>
                <p className="text-xs text-muted-foreground">Usuários ativos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{usersData?.filter((u) => u.type === 0).length ?? 0}</div>
                <p className="text-xs text-muted-foreground">Clientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{usersData?.filter((u) => u.type === 1).length ?? 0}</div>
                <p className="text-xs text-muted-foreground">Administradores</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.userId} className="flex flex-col justify-between h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg truncate">{user.fullName}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">ID: {user.userId}</CardDescription>
                    </div>
                    <Badge variant={user.type === 1 ? "default" : "secondary"}>{user.type === 1 ? "Admin" : "Cliente"}</Badge>
                  </div>
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
                    <Button variant="ghost" size="sm" onClick={() => deleteUser(user.userId)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
