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
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DependencyModal } from "./dependency-modal"

interface DeletePermanentlyModalProps {
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
  onDeleted?: () => void
}

const typeLabels = {
  cliente: "Cliente",
  orcamento: "Orçamento",
  produto: "Produto/Serviço", 
  categoria: "Categoria"
}

export function DeletePermanentlyModal({
  open,
  onOpenChange,
  item,
  workspaceId,
  onDeleted
}: DeletePermanentlyModalProps) {
  const [loading, setLoading] = useState(false)
  const [dependencyError, setDependencyError] = useState<any>(null)
  const [showDependencyModal, setShowDependencyModal] = useState(false)
  const { toast } = useToast()

  const handleDelete = async (force = false) => {
    try {
      setLoading(true)
      
      const response = await fetch(
        `/api/workspace/${workspaceId}/lixeira/delete-permanently`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: item.id,
            type: item.type,
            force: force
          }),
        }
      )

      const responseData = await response.json()

      if (!response.ok) {
        // Se for erro de dependência, mostrar modal específico
        // CLIENT_HAS_BUDGETS e PRODUCT_HAS_BUDGET_ITEMS removidos da lista pois agora é seguro excluir clientes e produtos
        if (['CATEGORY_HAS_PRODUCTS'].includes(responseData.error)) {
          setDependencyError(responseData)
          setShowDependencyModal(true)
          onOpenChange(false)
          return
        }
        
        throw new Error(responseData.message || responseData.error || "Erro ao excluir permanentemente")
      }

      toast.success(`${item.name} foi excluido permanentemente.`)

      onDeleted?.()
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao excluir permanentemente:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao excluir permanentemente")
    } finally {
      setLoading(false)
    }
  }

  const handleForceDelete = async () => {
    setShowDependencyModal(false)
    await handleDelete(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
          <DialogHeader>
            <DialogTitle>
              Excluir Permanentemente
            </DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. O item será removido permanentemente do sistema e não poderá ser recuperado.
              {item.type === 'cliente' && (
                <><br /><br />
                <strong>Nota:</strong> Os orçamentos associados a este cliente serão preservados com todos os dados do cliente intactos.
                </>
              )}
              {item.type === 'produto' && (
                <><br /><br />
                <strong>Nota:</strong> Os orçamentos que utilizam este produto/serviço serão preservados com todos os dados do produto intactos.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="font-medium text-red-800">{item.name} <span className="text-sm">- {typeLabels[item.type]}</span></div>
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
              variant="destructive"
              onClick={() => handleDelete(false)}
              disabled={loading}
              className='bg-red-600 hover:bg-red-700 cursor-pointer'
            >
              Excluir Permanentemente
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {dependencyError && (
        <DependencyModal
          open={showDependencyModal}
          onOpenChange={setShowDependencyModal}
          item={item}
          error={dependencyError}
          onForceDelete={handleForceDelete}
        />
      )}
    </>
  )
}