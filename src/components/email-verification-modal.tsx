'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
}

export function EmailVerificationModal({ isOpen, onClose, userEmail }: EmailVerificationModalProps) {
  const [isResending, setIsResending] = useState(false)
  const { toast } = useToast()

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      if (response.ok) {
        toast.success("Email de verificação reenviado", {
          description: "Verifique sua caixa de entrada e spam."
        })
      } else {
        throw new Error('Erro ao reenviar email')
      }
    } catch (error) {
      toast.error("Erro ao reenviar email", {
        description: "Tente novamente em alguns minutos."
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <DialogTitle className="text-xl">Verificação de Email Necessária</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            <p>
              Para continuar usando o sistema, você precisa verificar seu email.
            </p>
            <p className="font-medium">
              Enviamos um link de verificação para:
            </p>
            <p className="text-sm font-mono bg-muted p-2 rounded">
              {userEmail}
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e pasta de spam.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reenviar Email de Verificação
              </>
            )}
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Fechar (Verificar Depois)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center mt-4">
          <p>
            Após verificar seu email, recarregue a página ou faça login novamente.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}