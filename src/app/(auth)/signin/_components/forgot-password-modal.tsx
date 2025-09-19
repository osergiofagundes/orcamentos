"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2, Mail } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { authClient } from "@/lib/auh-client"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(formData: ForgotPasswordFormValues) {
    setIsLoading(true)
    
    try {
      await authClient.forgetPassword({
        email: formData.email,
        redirectTo: "/reset-password",
      })
      
      setEmailSent(true)
      setIsLoading(false)
    } catch (error) {
      console.error("Erro ao enviar email de reset:", error)
      setIsLoading(false)
    }
  }

  function handleClose() {
    onOpenChange(false)
    setEmailSent(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Esqueceu sua senha?
          </DialogTitle>
          <DialogDescription>
            {emailSent 
              ? "Verifique seu email para redefinir sua senha."
              : "Digite seu email e enviaremos um link para redefinir sua senha."
            }
          </DialogDescription>
        </DialogHeader>
        
        {emailSent ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-sky-50 p-4 text-sky-700 border border-sky-200">
              <p className="text-sm">
                Email enviado com sucesso! 
                <br />
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full border hover:text-red-500 bg-transparent text-black hover:bg-transparent hover:border-red-500 cursor-pointer">
              Fechar
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com" 
                        type="email" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border hover:text-red-500 hover:border-red-500 cursor-pointer"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-700 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Email"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
