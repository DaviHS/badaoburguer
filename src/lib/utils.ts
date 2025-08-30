import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const FILTER_STORAGE_KEY = "cart";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const statusTranslations: Record<string, string> = {
  answered: "Atendida",
  busy: "Ocupado",
  cancelled: "Cancelada",
  failed: "Falha",
  missed: "Perdida",
  no_answer: "Não Atendida",
  voicemail: "Correio de voz",
  outbound: "Realizada",
  inbound: "Recebida",
}

export const cleanNullValues = (obj: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  );
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "Concluído":
      return "bg-green-100 hover:bg-green-300 text-green-800"
    case "Em andamento":
      return "bg-blue-100 hover:bg-blue-300 text-blue-800"
    case "Pendente":
      return "bg-yellow-100 hover:bg-yellow-300 text-yellow-800"
    case "Cancelado":
      return "bg-red-100 hover:bg-red-300 text-red-800"
    default:
      return "bg-gray-100 hover:bg-gray-300 text-gray-800"
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Crítica":
      return "bg-red-100 hover:bg-red-300 text-red-800"
    case "Alta":
      return "bg-orange-100 hover:bg-orange-300 text-orange-800"
    case "Média":
      return "bg-yellow-100 hover:bg-yellow-300 text-yellow-800"
    case "Baixa":
      return "bg-green-100 hover:bg-green-300 text-green-800"
    default:
      return "bg-gray-100 hover:bg-gray-300 text-gray-800"
  }
}

export const getNumberStatusColor = (status: number) => {
  return status === 1 ? 
  "bg-green-100 hover:bg-green-300 text-green-800" 
  : "bg-red-100 hover:bg-red-300 text-red-800"
}

export const getStatusText = (status: number) => (status === 1 ? "Ativa" : "Inativa")

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 hover:bg-purple-300",
  operator: "bg-blue-100 text-blue-800 hover:bg-blue-300",
  viewer: "bg-orange-100 text-orange-800 hover:bg-orange-300",
}

export const getRoleColor = (role: string) => {
  return roleColors[role] || "bg-gray-100 text-gray-800 hover:bg-gray-300"
}

export const getRoleText = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrador"
    case "operator":
      return "Operador"
    case "viewer":
      return "Visualizador"
    default:
      return role
  }
}
