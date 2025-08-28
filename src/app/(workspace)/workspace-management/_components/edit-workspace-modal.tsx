'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { toast } from "sonner"
import { Pencil } from 'lucide-react'

interface EditWorkspaceModalProps {
  workspace: {
    id: number
    nome: string
    cpf_cnpj: string | null
  }
  onWorkspaceUpdated?: () => void
}

export function EditWorkspaceModal({ workspace, onWorkspaceUpdated }: EditWorkspaceModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: workspace.nome,
    cpf_cnpj: workspace.cpf_cnpj || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/workspace/${workspace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar área de trabalho')
      }

      toast.success('Área de trabalho atualizada com sucesso.')

      // Close modal
      setIsOpen(false)

      // Callback para atualizar a lista de workspaces
      if (onWorkspaceUpdated) {
        onWorkspaceUpdated()
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao atualizar a área de trabalho.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when closing
      setFormData({
        nome: workspace.nome,
        cpf_cnpj: workspace.cpf_cnpj || ''
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-blue-50 hover:text-blue-600"
        title="Editar área de trabalho"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Editar Área de Trabalho</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua área de trabalho
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Área de Trabalho *</Label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Meu Negócio"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={handleChange}
              placeholder="Opcional - para identificação"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Atualizar Área de Trabalho'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
