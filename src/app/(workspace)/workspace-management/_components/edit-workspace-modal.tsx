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
import { Edit, Loader2, Pencil } from 'lucide-react'
import { formatCpfCnpj, validateCpfCnpj } from '@/lib/formatters'

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
  const [errors, setErrors] = useState({
    nome: '',
    cpf_cnpj: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação
    const newErrors = {
      nome: '',
      cpf_cnpj: ''
    }
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }
    
    if (formData.cpf_cnpj && !validateCpfCnpj(formData.cpf_cnpj)) {
      newErrors.cpf_cnpj = 'CPF/CNPJ inválido'
    }
    
    setErrors(newErrors)
    
    // Se há erros, não submete
    if (newErrors.nome || newErrors.cpf_cnpj) {
      return
    }
    
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
    
    let formattedValue = value
    if (name === 'cpf_cnpj') {
      formattedValue = formatCpfCnpj(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
    // Limpa erro quando o usuário começa a digitar
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Reset form when closing
      setFormData({
        nome: workspace.nome,
        cpf_cnpj: workspace.cpf_cnpj || ''
      })
      setErrors({
        nome: '',
        cpf_cnpj: ''
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-600 cursor-pointer"
        title="Editar área de trabalho"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600">
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
              className={errors.nome ? "border-red-600" : ""}
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              name="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={handleChange}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              className={errors.cpf_cnpj ? "border-red-600" : ""}
            />
            {errors.cpf_cnpj && (
              <p className="text-sm text-red-600">{errors.cpf_cnpj}</p>
            )}
          </div>

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
            <Button type="submit" disabled={isLoading} className='bg-sky-600 hover:bg-sky-700 cursor-pointer'>
              {isLoading ? (<>Salvando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Salvar Alterações <Edit className="h-4 w-4" /></>)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
