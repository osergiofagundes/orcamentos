'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { toast } from "sonner"
import { Trash2 } from 'lucide-react'

interface DeleteWorkspaceModalProps {
  workspace: {
    id: number
    nome: string
  }
  onWorkspaceDeleted?: () => void
}

export function DeleteWorkspaceModal({ workspace, onWorkspaceDeleted }: DeleteWorkspaceModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/workspace/${workspace.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir área de trabalho')
      }

      toast.success('Área de trabalho excluída com sucesso.')

      // Close modal
      setIsOpen(false)

      // Callback para atualizar a lista de workspaces
      if (onWorkspaceDeleted) {
        onWorkspaceDeleted()
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao excluir a área de trabalho.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        title="Excluir área de trabalho"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir Área de Trabalho</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a área de trabalho "{workspace.nome}"?
            <br />
            <span className="text-red-600 font-medium">
              Esta ação não pode ser desfeita.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
