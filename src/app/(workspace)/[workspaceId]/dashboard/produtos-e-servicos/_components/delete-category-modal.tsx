"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "sonner"

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
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
          <AlertDialogDescription>
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
                Esta ação não pode ser desfeita.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          {!hasProducts && (
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
