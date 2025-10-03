'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

interface UseEmailVerificationOptions {
  userEmail?: string
  isEmailVerified?: boolean
}

export function useEmailVerification({ userEmail, isEmailVerified }: UseEmailVerificationOptions) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasShownInitialModal, setHasShownInitialModal] = useState(false)
  const { toast } = useToast()

  // Mostrar modal inicial se email não foi verificado
  useEffect(() => {
    if (isEmailVerified === false && !hasShownInitialModal && userEmail) {
      setIsModalOpen(true)
      setHasShownInitialModal(true)
    }
  }, [isEmailVerified, hasShownInitialModal, userEmail])

  // Função para verificar se pode executar uma ação
  const checkEmailVerificationBeforeAction = useCallback((actionCallback: () => void | Promise<void>) => {
    if (isEmailVerified === false) {
      setIsModalOpen(true)
      toast.error("Verificação de email necessária", {
        description: "Você precisa verificar seu email antes de realizar esta ação."
      })
      return
    }
    
    // Se o email está verificado, executa a ação
    actionCallback()
  }, [isEmailVerified, toast])

  // Função para fechar o modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  return {
    isModalOpen,
    closeModal,
    checkEmailVerificationBeforeAction,
    shouldShowModal: isEmailVerified === false
  }
}