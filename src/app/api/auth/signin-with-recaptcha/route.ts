import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    console.log('[SIGNIN] Iniciando processo de login')
    
    const body = await request.json()
    const { email, password, recaptchaToken } = body

    console.log('[SIGNIN] Dados recebidos:', { 
      email, 
      hasPassword: !!password, 
      hasToken: !!recaptchaToken 
    })

    // Validações básicas
    if (!email || !password) {
      console.log('[SIGNIN] Erro: Email ou senha não fornecidos')
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (!recaptchaToken) {
      console.log('[SIGNIN] Erro: Token reCAPTCHA não fornecido')
      return NextResponse.json(
        { error: 'Token reCAPTCHA é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar reCAPTCHA diretamente
    console.log('[SIGNIN] Verificando reCAPTCHA...')
    try {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY
      
      if (!secretKey) {
        console.error('[SIGNIN] RECAPTCHA_SECRET_KEY não configurada')
        return NextResponse.json(
          { error: 'Configuração do servidor incompleta' },
          { status: 500 }
        )
      }

      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: recaptchaToken,
        }),
      })

      const recaptchaResult = await recaptchaResponse.json()
      console.log('[SIGNIN] Resultado reCAPTCHA:', recaptchaResult)

      if (!recaptchaResult.success) {
        console.log('[SIGNIN] Erro: reCAPTCHA inválido')
        return NextResponse.json(
          { error: 'Falha na verificação reCAPTCHA. Tente novamente.' },
          { status: 400 }
        )
      }
    } catch (recaptchaError) {
      console.error('[SIGNIN] Erro ao verificar reCAPTCHA:', recaptchaError)
      return NextResponse.json(
        { error: 'Erro na verificação reCAPTCHA' },
        { status: 500 }
      )
    }

    console.log('[SIGNIN] reCAPTCHA válido, buscando usuário...')

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    })

    if (!user) {
      console.log('[SIGNIN] Usuário não encontrado para email:', email)
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('[SIGNIN] Usuário encontrado:', { 
      id: user.id, 
      email: user.email, 
      accountsCount: user.accounts.length,
      emailVerified: user.emailVerified
    })

    // Buscar conta com senha
    const passwordAccount = user.accounts.find(account => account.password)
    
    if (!passwordAccount || !passwordAccount.password) {
      console.log('[SIGNIN] Conta com senha não encontrada')
      console.log('[SIGNIN] Contas disponíveis:', user.accounts.map(acc => ({ 
        providerId: acc.providerId, 
        hasPassword: !!acc.password 
      })))
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('[SIGNIN] Conta com senha encontrada, verificando senha...')

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, passwordAccount.password)

    if (!isPasswordValid) {
      console.log('[SIGNIN] Senha inválida')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('[SIGNIN] Senha válida, login bem-sucedido')

    // Login bem-sucedido
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
      message: user.emailVerified 
        ? 'Login realizado com sucesso' 
        : 'Login realizado com sucesso. Por favor, verifique seu email.',
    })
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