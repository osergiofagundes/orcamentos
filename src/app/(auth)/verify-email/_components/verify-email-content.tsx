'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Token de verificação não encontrado')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          setStatus('success')
          setMessage('Email verificado com sucesso!')
          
          // Redirecionar após 3 segundos
          setTimeout(() => {
            router.push('/workspace-management')
          }, 3000)
        } else {
          const data = await response.json()
          setStatus('error')
          setMessage(data.error || 'Erro ao verificar email')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Erro de conexão. Tente novamente.')
        console.error('Erro ao verificar email:', error)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'error':
      case 'expired':
        return <XCircle className="h-16 w-16 text-red-600" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verificando email...'
      case 'success':
        return 'Email verificado!'
      case 'error':
        return 'Erro na verificação'
      case 'expired':
        return 'Token expirado'
    }
  }

  return (
    <>
      <a href="/" className="flex items-center gap-2 self-center font-medium">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src="/images/logo.png" alt='Logo' />
        </Avatar>
        Sky Orçamentos
      </a>
      
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          {getStatusIcon()}
        </div>
        
        <h1 className="text-2xl font-bold">{getStatusTitle()}</h1>
        
        <p className="text-gray-600">
          {message}
        </p>
        
        {status === 'success' && (
          <p className="text-sm text-gray-500">
            Redirecionando para o painel em alguns segundos...
          </p>
        )}
        
        {status === 'error' && (
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/signin')}
              className="w-full"
            >
              Voltar para o login
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/workspace-management')}
              className="w-full"
            >
              Ir para o painel
            </Button>
          </div>
        )}
      </div>
    </>
  )
}