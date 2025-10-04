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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <DialogTitle>Verificação de Email</DialogTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left">
            Para garantir a segurança da sua conta, você precisa verificar seu email antes de continuar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              📧 Um email de verificação foi enviado para:
            </p>
            <p className="font-medium text-blue-900 mt-1">
              {userEmail}
            </p>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              • Verifique sua caixa de entrada e clique no link de verificação
            </p>
            <p>
              • Não esquece de verificar na pasta de spam/lixo eletrônico
            </p>
            <p>
              • Após verificar, você poderá acessar todas as funcionalidades
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full sm:w-auto"
          >
            {isResending ? "Reenviando..." : "Reenviar Email"}
          </Button>
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}