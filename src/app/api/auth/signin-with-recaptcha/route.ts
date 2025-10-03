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
    console.log('Searching for user with email:', email)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    })

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('User found:', { id: user.id, email: user.email, emailVerified: user.emailVerified })
    console.log('User accounts:', user.accounts.map(acc => ({ providerId: acc.providerId, hasPassword: !!acc.password })))

    // Verificar se o usuário tem uma conta com senha (independente do provider)
    const emailAccount = user.accounts.find(account => account.password)
    
    if (!emailAccount || !emailAccount.password) {
      console.log('No email account found or no password set')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('Email account found, verifying password...')
    // Verificar a senha
    const isValidPassword = await bcrypt.compare(password, emailAccount.password)
    
    if (!isValidPassword) {
      console.log('Password verification failed')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('Password verified successfully')

    // Permitir login mesmo com email não verificado, mas informar o usuário
    if (!user.emailVerified) {
      console.log('User email not verified, but allowing login')
      // Opcional: você pode escolher se quer bloquear ou permitir
      // Para agora, vamos permitir o login e apenas avisar
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
      return NextResponse.json({ 
        success: true, 
        data: result,
        emailVerified: user.emailVerified,
        message: !user.emailVerified ? 'Login realizado com sucesso. Recomendamos verificar seu email.' : undefined
      })
    } else {
      // Se o Better Auth falhar, pelo menos já validamos as credenciais
      return NextResponse.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name },
        emailVerified: user.emailVerified,
        message: !user.emailVerified ? 'Login realizado com sucesso. Recomendamos verificar seu email.' : undefined
      })
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