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
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
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
        toast.success("Orçamento enviado para lixeira com sucesso!")
        onClose()
        onOrcamentoDeleted()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erro ao enviar orçamento para lixeira")
      }
    } catch (error) {
      console.error("Erro ao enviar orçamento para lixeira:", error)
      toast.error("Erro ao enviar orçamento para lixeira")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> 
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Confirmar envio para lixeira</DialogTitle>
          </div>
          <DialogDescription>
            Tem certeza que deseja enviar para lixeira o orçamento <strong>#{orcamentoNumero}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={deleting} className='border hover:text-red-600 hover:border-red-600 cursor-pointer'>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleting}
            className='bg-red-600 hover:bg-red-700 cursor-pointer'
          >
            {deleting ? (<>Enviando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Enviar para lixeira <Trash2 className="h-4 w-4" /></>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
