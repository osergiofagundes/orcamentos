"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { toast } from "sonner"
import { ComponentProps } from "react"

interface ProtectedButtonProps extends ComponentProps<typeof Button> {
  needsEmailVerification?: boolean
  onVerificationNeeded?: () => void
}

export function ProtectedButton({ 
  needsEmailVerification = false,
  onVerificationNeeded,
  onClick,
  disabled,
  className,
  title,
  children,
  ...props 
}: ProtectedButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (needsEmailVerification) {
      e.preventDefault()
      toast.error("Você precisa verificar seu email antes de realizar esta ação", {
        icon: <Mail className="h-4 w-4" />,
        action: onVerificationNeeded ? {
          label: "Verificar agora",
          onClick: onVerificationNeeded,
        } : undefined,
      })
      return
    }
    
    onClick?.(e)
  }

  return (
    <Button
      {...props}
      disabled={disabled || needsEmailVerification}
      onClick={handleClick}
      className={needsEmailVerification ? `${className || ''} opacity-60` : className}
      title={needsEmailVerification ? "Verifique seu email para habilitar esta ação" : title}
    >
      {children}
    </Button>
  )
}