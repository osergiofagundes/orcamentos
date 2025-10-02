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

interface Product {
  id: number
  nome: string
  valor?: number | null
  categoria: {
    nome: string
  } | null
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
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/produtos/${product.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao enviar produto/serviço para lixeira")
      }

      toast.success("Produto/serviço enviado para lixeira com sucesso!")
      onClose()
      onProductDeleted?.()
      router.refresh()
    } catch (error) {
      console.error("Erro ao enviar produto/serviço para lixeira:", error)
      
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Erro ao enviar produto/serviço para lixeira")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> 
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <DialogTitle>Confirmar envio para lixeira</DialogTitle>
          <DialogDescription>
            <>
              Tem certeza que deseja enviar para lixeira o produto/serviço <strong>{product.nome}</strong>?
            </>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className='border hover:text-red-600 hover:border-red-600 cursor-pointer'>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
            className='bg-red-600 hover:bg-red-700 cursor-pointer'
          >
            {isLoading ? "Enviando..." : "Enviar para lixeira"}
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
