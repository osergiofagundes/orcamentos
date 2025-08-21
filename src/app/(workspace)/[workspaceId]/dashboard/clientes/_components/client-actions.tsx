"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { EditClientModal } from "./edit-client-modal"
import { DeleteClientModal } from "./delete-client-modal"

interface Client {
  id: number
  nome: string
  cpf_cnpj: string
  telefone: string
  email: string
  endereco: string
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
}

interface ClientActionsProps {
  client: Client
  workspaceId: string
  onUpdate?: () => void
}

export function ClientActions({ client, workspaceId, onUpdate }: ClientActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditClientModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        client={client}
        workspaceId={workspaceId}
        onSuccess={onUpdate}
      />

      <DeleteClientModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        client={client}
        workspaceId={workspaceId}
        onSuccess={onUpdate}
      />
    </>
  )
}
