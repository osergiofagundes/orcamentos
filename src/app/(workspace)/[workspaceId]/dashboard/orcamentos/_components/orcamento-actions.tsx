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
import { MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react"
import { EditOrcamentoModal } from "./edit-orcamento-modal"
import { DeleteOrcamentoModal } from "./delete-orcamento-modal"
import { generateOrcamentoPDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

interface Orcamento {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  // Dados desnormalizados do cliente
  cliente_nome: string
  cliente_cpf_cnpj: string | null
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const router = useRouter()

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true)
      toast.loading("Gerando PDF...", { id: "pdf-generation" })
      
      // Buscar dados completos do orçamento para o PDF
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos/${orcamento.id}/pdf`)
      
      if (!response.ok) {
        throw new Error("Erro ao buscar dados do orçamento")
      }
      
      const orcamentoData = await response.json()
      
      // Gerar PDF
      await generateOrcamentoPDF(orcamentoData)
      
      toast.success("PDF gerado com sucesso!", { id: "pdf-generation" })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast.error("Erro ao gerar PDF", { id: "pdf-generation" })
    } finally {
      setIsGeneratingPdf(false)
    }
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
          <DropdownMenuItem onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
            <Download className="mr-2 h-4 w-4" />
            Gerar PDF
          </DropdownMenuItem>
          {canEdit && (
            <>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Enviar para lixeira
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
            clienteNome={orcamento.cliente_nome}
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
