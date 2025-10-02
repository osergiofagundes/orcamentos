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
import { Loader2, Trash2 } from "lucide-react"

interface Client {
  id: number
  nome: string
  cpf_cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
}

interface DeleteClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  workspaceId: string
  onSuccess?: () => void
}

export function DeleteClientModal({ isOpen, onClose, client, workspaceId, onSuccess }: DeleteClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/clientes/${client.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao enviar cliente para lixeira")
      }

      toast.success("Cliente enviado para lixeira com sucesso!")
      onClose()
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar cliente para lixeira")
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
            Tem certeza que deseja enviar para lixeira o cliente <strong>{client.nome}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} className='border hover:text-red-600 hover:border-red-600 cursor-pointer'>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
            className='bg-red-600 hover:bg-red-700 cursor-pointer'
          >
            {isLoading ? (<>Enviando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Enviar para lixeira <Trash2 className="h-4 w-4" /></>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
