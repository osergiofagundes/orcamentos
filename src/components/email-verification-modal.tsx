"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function EmailVerificationModal({ 
  isOpen, 
  onClose, 
  userEmail 
}: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false)

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      // Aqui você pode implementar a lógica para reenviar o email de verificação
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })
      
      if (response.ok) {
        toast.success('Email de verificação reenviado com sucesso!')
      } else {
        toast.error('Erro ao reenviar email. Tente novamente.')
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error)
      toast.error('Erro ao reenviar email. Tente novamente.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent  className="sm:max-w-lg border-l-8">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle>Verificação de Email</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">
            Para garantir a segurança da sua conta, você precisa verificar seu email antes de continuar.
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <p className="text-sm text-sky-800">
              Um email de verificação foi enviado para:
            </p>
            <p className="font-medium text-sm text-sky-900 mt-1">
              {userEmail}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full sm:w-auto border hover:text-sky-600 hover:border-sky-600 cursor-pointer"
          >
            {isResending ? "Reenviando..." : "Reenviar Email"}
          </Button>
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 cursor-pointer"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}