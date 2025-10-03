import { NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password, recaptchaToken } = await request.json()

    // Validar reCAPTCHA primeiro
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'Token reCAPTCHA é obrigatório' },
        { status: 400 }
      )
    }

    console.log('Validating reCAPTCHA token...')
    const isRecaptchaValid = await validateRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      console.log('reCAPTCHA validation failed')
      return NextResponse.json(
        { error: 'Falha na verificação reCAPTCHA. Tente novamente.' },
        { status: 400 }
      )
    }

    console.log('reCAPTCHA validation successful, attempting login...')
    
    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem uma conta de email/senha (Better Auth usa 'credential' como providerId)
    const emailAccount = user.accounts.find(account => account.providerId === 'credential' || account.providerId === 'email')
    
    if (!emailAccount || !emailAccount.password) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar a senha
    const isValidPassword = await bcrypt.compare(password, emailAccount.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verificar se o email está verificado
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email não verificado. Verifique seu email antes de fazer login.' },
        { status: 403 }
      )
    }

    // Se chegou até aqui, o login é válido
    // Agora vamos fazer a requisição para o endpoint real do Better Auth para criar a sessão
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`
    
    const authResponse = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    if (authResponse.ok) {
      const result = await authResponse.json()
      return NextResponse.json({ success: true, data: result })
    } else {
      // Se o Better Auth falhar, pelo menos já validamos as credenciais
      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
    }
  } catch (error) {
    console.error('Erro no login com reCAPTCHA:', error)
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}