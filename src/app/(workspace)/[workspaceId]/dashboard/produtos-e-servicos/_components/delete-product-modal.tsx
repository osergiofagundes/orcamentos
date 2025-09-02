"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Product {
  id: number
  nome: string
  valor?: number | null
  categoria: {
    nome: string
  }
}

interface DeleteProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  workspaceId: string
  onProductDeleted?: () => void
}

export function DeleteProductModal({ isOpen, onClose, product, workspaceId, onProductDeleted }: DeleteProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [forceDelete, setForceDelete] = useState(false)
  const [showForceOption, setShowForceOption] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const url = forceDelete 
        ? `/api/workspace/${workspaceId}/produtos/${product.id}?force=true`
        : `/api/workspace/${workspaceId}/produtos/${product.id}`
        
      const response = await fetch(url, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Se o erro for relacionado a orçamentos, mostrar opção de força
        if (error.message.includes("orçamento") && !showForceOption) {
          setShowForceOption(true)
          setIsLoading(false)
          return
        }
        
        throw new Error(error.message || "Erro ao excluir produto/serviço")
      }

      toast.success("Produto/serviço excluído com sucesso!")
      onClose()
      onProductDeleted?.()
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao excluir produto/serviço")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetModal = () => {
    setShowForceOption(false)
    setForceDelete(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}> 
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <DialogTitle>Excluir Produto/Serviço</DialogTitle>
          <DialogDescription>
            {!showForceOption ? (
              <>
                Tem certeza que deseja excluir <strong>{product.nome}</strong>?
                <br />
                <span className="text-red-600 font-medium">
                  Esta ação não pode ser desfeita.
                </span>
              </>
            ) : (
              <div className="space-y-4">
                <p>
                  O produto <strong>{product.nome}</strong> está sendo usado em orçamentos e não pode ser excluído diretamente.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Opções disponíveis:</strong>
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Cancelar e remover o produto dos orçamentos manualmente</li>
                    <li>• Forçar exclusão (removerá o produto de todos os orçamentos)</li>
                  </ul>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="force-delete" 
                    checked={forceDelete}
                    onCheckedChange={(checked: boolean) => setForceDelete(checked)}
                  />
                  <label htmlFor="force-delete" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Forçar exclusão (remover dos orçamentos automaticamente)
                  </label>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetModal} disabled={isLoading} className='border hover:text-red-500 hover:border-red-500 cursor-pointer'>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading || (showForceOption && !forceDelete)}
            className='bg-red-500 hover:bg-red-600 cursor-pointer'
          >
            {isLoading ? "Excluindo..." : showForceOption ? "Confirmar Exclusão" : "Excluir"}
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
