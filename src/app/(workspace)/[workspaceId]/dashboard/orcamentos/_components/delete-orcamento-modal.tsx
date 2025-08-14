"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface DeleteOrcamentoModalProps {
  orcamentoId: number
  orcamentoNumero: string
  clienteNome: string
  valorTotal: number | null
  workspaceId: string
  isOpen: boolean
  onClose: () => void
  onOrcamentoDeleted: () => void
}

export function DeleteOrcamentoModal({
  orcamentoId,
  orcamentoNumero,
  clienteNome,
  valorTotal,
  workspaceId,
  isOpen,
  onClose,
  onOrcamentoDeleted,
}: DeleteOrcamentoModalProps) {
  const [deleting, setDeleting] = useState(false)

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos/${orcamentoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Orçamento excluído com sucesso!")
        onClose()
        onOrcamentoDeleted()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erro ao excluir orçamento")
      }
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error)
      toast.error("Erro ao excluir orçamento")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o orçamento <strong>#{orcamentoNumero}</strong>?
          </AlertDialogDescription>
          
          <div className="space-y-3 mt-4">
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <span className="text-sm font-medium">{clienteNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor Total:</span>
                <span className="text-sm font-medium">{formatCurrency(valorTotal)}</span>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ Atenção:</strong> Esta ação não pode ser desfeita. Todos os dados do orçamento, incluindo itens e histórico, serão permanentemente removidos.
              </p>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleting ? "Excluindo..." : "Excluir Orçamento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
