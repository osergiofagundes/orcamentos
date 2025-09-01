'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { KeyRound, MailPlus } from 'lucide-react'
import { toast } from 'sonner'

interface JoinWithCodeModalProps {
  onWorkspaceJoined: () => void
  buttonText?: string
}

export function JoinWithCodeModal({ onWorkspaceJoined, buttonText = "Entrar com Código" }: JoinWithCodeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      toast.error('Por favor, insira o código de convite')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/workspace/join-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: inviteCode.trim(),
          mensagem: message.trim() || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao solicitar entrada')
      }

      toast.success('Solicitação enviada com sucesso! Aguarde a aprovação do administrador.')
      setIsOpen(false)
      setInviteCode('')
      setMessage('')
      onWorkspaceJoined() // Refresh workspaces list
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar solicitação')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      setIsOpen(open)
      if (!open) {
        setInviteCode('')
        setMessage('')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className='cursor-pointer hover:text-sky-600 hover:border-sky-600'>
          {buttonText}
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600">
        <DialogHeader>
          <DialogTitle>Entrar em Workspace</DialogTitle>
          <DialogDescription>
            Digite o código de convite para solicitar entrada em um workspace existente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Código de Convite *</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="Cole aqui o código de convite"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              disabled={isLoading}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Adicione uma mensagem para o administrador do workspace..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className='border hover:text-red-500 hover:border-red-500 cursor-pointer'
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className='bg-sky-600 hover:bg-sky-700 cursor-pointer'>
              {isLoading ? 'Enviando...' : 'Solicitar Entrada'}
              <MailPlus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
