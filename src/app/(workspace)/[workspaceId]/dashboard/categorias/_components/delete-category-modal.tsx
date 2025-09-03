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

interface Category {
  id: number
  nome: string
  _count?: {
    produtosServicos?: number
  }
}

interface DeleteCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category
  workspaceId: string
}

export function DeleteCategoryModal({ isOpen, onClose, category, workspaceId }: DeleteCategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/categorias/${category.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao excluir categoria")
      }

      toast.success("Categoria excluída com sucesso!")
      onClose()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir categoria")
    } finally {
      setIsLoading(false)
    }
  }

  const hasProducts = (category._count?.produtosServicos || 0) > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> 
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <DialogTitle>Excluir Categoria</DialogTitle>
          <DialogDescription>
            {hasProducts ? (
              <>
                <span className="text-destructive font-medium">Atenção!</span>
                <br />
                A categoria <strong>{category.nome}</strong> possui {category._count?.produtosServicos} produto{(category._count?.produtosServicos || 0) !== 1 ? 's' : ''} associado{(category._count?.produtosServicos || 0) !== 1 ? 's' : ''}.
                <br />
                <br />
                Para excluir esta categoria, primeiro remova ou reclassifique todos os produtos associados.
              </>
            ) : (
              <>
                Tem certeza que deseja excluir a categoria <strong>{category.nome}</strong>?
                <br />
                <span className="text-red-600 font-medium">
                  Esta ação não pode ser desfeita.
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className='border hover:text-red-500 hover:border-red-500 cursor-pointer'>
            Cancelar
          </Button>
          {!hasProducts && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
              className='bg-red-500 hover:bg-red-600 cursor-pointer'
            >
              {isLoading ? "Excluindo..." : "Excluir"}
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
