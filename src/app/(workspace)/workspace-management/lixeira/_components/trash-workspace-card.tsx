'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { toast } from "sonner"
import { Loader2, RotateCcw, Trash2, User } from 'lucide-react'

// Função para formatar data de forma consistente entre servidor e cliente
const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

interface TrashedWorkspaceData {
  id: number;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  logo_url: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  inTrash: boolean;
  trashedAt: Date | null;
  trashedBy: string | null;
  usuarioQueMoveuParaLixeira: {
    name: string;
    email: string;
  } | null;
}

interface TrashWorkspaceCardProps {
  workspace: TrashedWorkspaceData & {
    usuariosAreas: {
      nivel_permissao: number
    }[]
  }
  userPermissionLevel: number
  onWorkspaceAction?: () => void
  disabled?: boolean
  onDisabledClick?: () => void
}

export function TrashWorkspaceCard({ 
  workspace, 
  userPermissionLevel, 
  onWorkspaceAction,
  disabled = false,
  onDisabledClick 
}: TrashWorkspaceCardProps) {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getPermissionLabel = (level: number) => {
    switch(level) {
      case 3: return 'Admin'
      case 2: return 'Membro 2'
      default: return 'Membro 1'
    }
  }

  const handleRestore = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/workspace/${workspace.id}/trash`, {
        method: 'DELETE', // DELETE para restaurar
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Falha ao restaurar área de trabalho')
      }

      toast.success('Área de trabalho restaurada com sucesso.')
      setIsRestoreModalOpen(false)

      if (onWorkspaceAction) {
        onWorkspaceAction()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao restaurar a área de trabalho.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermanentDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/workspace/${workspace.id}/permanent`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Falha ao excluir área de trabalho permanentemente')
      }

      toast.success('Área de trabalho excluída permanentemente.')
      setIsPermanentDeleteModalOpen(false)

      if (onWorkspaceAction) {
        onWorkspaceAction()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro ao excluir a área de trabalho permanentemente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="border rounded-lg p-4 hover:shadow-md transition-shadow border-l-8 border-l-red-600 bg-red-50/30">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 flex-1">
            {workspace.logo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={workspace.logo_url}
                  alt={`Logo ${workspace.nome}`}
                  width={48}
                  height={48}
                  className="rounded-md object-contain opacity-60"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{workspace.nome}</h3>
            </div>
          </div>
          <Badge variant="outline" className="text-red-600 border-red-200">
            {getPermissionLabel(userPermissionLevel)}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm text-muted-foreground">
            Movido para lixeira em: {formatDate(workspace.trashedAt)}
          </div>
          {workspace.usuarioQueMoveuParaLixeira && (
            <div className="text-sm text-muted-foreground">
              Por: {workspace.usuarioQueMoveuParaLixeira.name}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {/* Apenas donos podem restaurar e excluir permanentemente */}
          {userPermissionLevel === 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={disabled ? onDisabledClick : () => setIsRestoreModalOpen(true)}
                disabled={disabled}
                className="flex-1 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-600 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restaurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disabled ? onDisabledClick : () => setIsPermanentDeleteModalOpen(true)}
                disabled={disabled}
                className="flex-1 hover:text-red-600 hover:bg-red-50 hover:border-red-600 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Modal de Restaurar */}
      <Dialog open={isRestoreModalOpen} onOpenChange={setIsRestoreModalOpen}>
        <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600">
          <DialogHeader>
            <DialogTitle>Restaurar Área de Trabalho</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja restaurar a área de trabalho "{workspace.nome}"?
              <br />
              <span className="text-sky-600 font-medium">
                Ela voltará a aparecer na sua lista de workspaces.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRestoreModalOpen(false)}
              disabled={isLoading}
              className='border hover:text-red-500 hover:border-red-500 cursor-pointer'
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleRestore}
              disabled={isLoading}
              className='bg-sky-600 hover:bg-sky-700 cursor-pointer'
            >
              {isLoading ? (<>Restaurando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Restaurar <RotateCcw className="h-4 w-4" /></>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão Permanente */}
      <Dialog open={isPermanentDeleteModalOpen} onOpenChange={setIsPermanentDeleteModalOpen}>
        <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
          <DialogHeader>
            <DialogTitle>Excluir Permanentemente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir permanentemente a área de trabalho "{workspace.nome}"?
              <br />
              <span className="text-red-600">
                Esta ação NÃO PODE ser desfeita! Todos os dados serão perdidos para sempre.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPermanentDeleteModalOpen(false)}
              disabled={isLoading}
              className='border hover:text-red-600 hover:border-red-600 cursor-pointer'
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handlePermanentDelete}
              disabled={isLoading}
              className='bg-red-600 hover:bg-red-700 cursor-pointer'
            >
              {isLoading ? (<>Excluindo... <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Excluir Permanentemente <Trash2 className="h-4 w-4 ml-1" /></>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}