'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { toast } from "sonner"
import { Plus } from 'lucide-react'

interface CreateWorkspaceModalProps {
  onWorkspaceCreated?: () => void
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function CreateWorkspaceModal({ 
  onWorkspaceCreated, 
  buttonText = "Nova Área de Trabalho",
  buttonVariant = "default"
}: CreateWorkspaceModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Falha ao criar área de trabalho')
      }

      const newWorkspace = await response.json()

      toast.success('Área de trabalho criada com sucesso.')

      // Reset form
      setFormData({
        nome: '',
        cpf_cnpj: ''
      })

      // Close modal
      setIsOpen(false)

      // Callback para atualizar a lista de workspaces ou navegar
      if (onWorkspaceCreated) {
        onWorkspaceCreated()
      } else {
        // Redireciona para a página do novo workspace
        router.push(`/${newWorkspace.id}/dashboard`)
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao criar a área de trabalho.')
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
        nome: '',
        cpf_cnpj: ''
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className='bg-blue-600 hover:bg-blue-700 cursor-pointer'>
          {buttonText}
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-blue-800">
        <DialogHeader>
          <DialogTitle>Criar Nova Área de Trabalho</DialogTitle>
          <DialogDescription>
            Configure uma nova área para gerenciar seus clientes e orçamentos
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
              className='border hover:text-red-500 hover:border-red-500 cursor-pointer'
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className='bg-blue-600 hover:bg-blue-700 cursor-pointer'>
              {isLoading ? 'Criando...' : 'Criar Área de Trabalho'}
              <Plus className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
