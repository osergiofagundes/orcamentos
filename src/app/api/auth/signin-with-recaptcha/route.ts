import { NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password, recaptchaToken } = await request.json()

    console.log('🔐 Tentativa de login para:', email)

    // Validar reCAPTCHA primeiro
    if (!recaptchaToken) {
      console.log('❌ Token reCAPTCHA não fornecido')
      return NextResponse.json(
        { error: 'Token reCAPTCHA é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🔍 Validando reCAPTCHA...')
    const isRecaptchaValid = await validateRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      console.log('❌ reCAPTCHA inválido')
      return NextResponse.json(
        { error: 'Falha na verificação reCAPTCHA. Tente novamente.' },
        { status: 400 }
      )
    }

    console.log('✅ reCAPTCHA válido, tentando fazer login...')

    // Criar uma nova requisição para o Better Auth
    const authRequest = new Request(request.url.replace('/signin-with-recaptcha', '/sign-in/email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries()),
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    // Se o reCAPTCHA for válido, realizar o login através do Better Auth
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: request.headers,
    })

    console.log('📊 Resultado do Better Auth:', result)

    if (!result || !result.user) {
      console.log('❌ Better Auth retornou resultado vazio ou sem usuário')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log('✅ Login realizado com sucesso')
    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('❌ Erro no login com reCAPTCHA:', error)
    console.error('❌ Stack trace:', error.stack)
    console.error('❌ Mensagem do erro:', error.message)
    
    // Tratar erros específicos do Better Auth
    if (error.message?.includes('Invalid email or password') || 
        error.message?.includes('User not found') ||
        error.message?.includes('password is incorrect') ||
        error.message?.includes('Invalid credentials') ||
        error.status === 401) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}