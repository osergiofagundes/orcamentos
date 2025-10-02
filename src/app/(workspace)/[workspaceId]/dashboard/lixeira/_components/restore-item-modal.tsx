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
import { Undo2, Loader2, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RestoreItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    type: "cliente" | "orcamento" | "produto" | "categoria"
    name: string
    deletedAt: string
    deletedBy: string
    deletedByName: string
    originalData: any
  }
  workspaceId: string
  onRestored?: () => void
}

const typeLabels = {
  cliente: "Cliente",
  orcamento: "Orçamento",
  produto: "Produto/Serviço",
  categoria: "Categoria"
}

export function RestoreItemModal({
  open,
  onOpenChange,
  item,
  workspaceId,
  onRestored
}: RestoreItemModalProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleRestore = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(
        `/api/workspace/${workspaceId}/lixeira/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: item.id,
            type: item.type,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao restaurar item")
      }

      toast.success(`${item.name} foi restaurado com sucesso.`)

      onRestored?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao restaurar item:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao restaurar item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600 rounded-lg">
        <DialogHeader>
          <DialogTitle>
            Restaurar Item
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja restaurar este item? Ele será movido de volta para o seu local original.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <div className="font-medium text-sky-800">{item.name} <span className="text-sm">- {typeLabels[item.type]}</span></div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className='border hover:text-red-600 hover:border-red-600 cursor-pointer'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRestore}
            disabled={loading}
            className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0'
          >
            Restaurar
            <RotateCcw className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}