"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    <Dialog open={isOpen} onOpenChange={onClose}> 
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </div>
          <DialogDescription>
            Tem certeza que deseja excluir o orçamento <strong>#{orcamentoNumero}</strong>?
            <br />
            <span className="text-red-600 font-medium">
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={deleting} className='border hover:text-red-500 hover:border-red-500 cursor-pointer'>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
            className='bg-red-500 hover:bg-red-600 cursor-pointer'
          >
            {deleting ? "Excluindo..." : "Excluir"}
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
