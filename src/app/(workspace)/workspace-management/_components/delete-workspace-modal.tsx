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

  const handleMoveToTrash = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/workspace/${workspace.id}/trash`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Falha ao mover área de trabalho para lixeira')
      }

      toast.success('Área de trabalho movida para lixeira.')

      // Close modal
      setIsOpen(false)

      // Callback para atualizar a lista de workspaces
      if (onWorkspaceDeleted) {
        onWorkspaceDeleted()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao mover a área de trabalho para lixeira.')
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
        className="p-2 hover:text-red-600 hover:bg-red-50 hover:border-red-600 cursor-pointer"
        title="Mover para lixeira"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <DialogTitle>Mover para Lixeira</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja mover a área de trabalho "{workspace.nome}" para a lixeira?
            <br />
            <span className="text-muted-foreground">
              Você poderá restaurá-la posteriormente se necessário.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className='border hover:text-red-600 hover:border-red-600 cursor-pointer'
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleMoveToTrash}
            disabled={isLoading}
            className='bg-red-600 hover:bg-red-700 cursor-pointer'
          >
            {isLoading ? 'Movendo...' : 'Mover para Lixeira'}
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
