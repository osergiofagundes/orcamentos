"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { EditOrcamentoModal } from "./edit-orcamento-modal"
import { DeleteOrcamentoModal } from "./delete-orcamento-modal"

interface Orcamento {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  cliente: {
    nome: string
    cpf_cnpj: string
  }
  usuario: {
    name: string
  }
}

interface OrcamentoActionsProps {
  orcamento: Orcamento
  workspaceId: string
  onUpdate?: () => void
}

export function OrcamentoActions({ orcamento, workspaceId, onUpdate }: OrcamentoActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()

  const handleView = () => {
    router.push(`/${workspaceId}/dashboard/orcamentos/${orcamento.id}`)
  }

  const canEdit = orcamento.status === "RASCUNHO" || orcamento.status === "ENVIADO"

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
          <DropdownMenuItem onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
          {canEdit && (
            <>
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canEdit && (
        <>
          <EditOrcamentoModal
            orcamentoId={orcamento.id}
            workspaceId={workspaceId}
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            onOrcamentoUpdated={() => {
              onUpdate?.()
            }}
          />

          <DeleteOrcamentoModal
            orcamentoId={orcamento.id}
            orcamentoNumero={orcamento.id.toString()}
            clienteNome={orcamento.cliente.nome}
            valorTotal={orcamento.valor_total}
            workspaceId={workspaceId}
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onOrcamentoDeleted={() => {
              onUpdate?.()
            }}
          />
        </>
      )}
    </>
  )
}
