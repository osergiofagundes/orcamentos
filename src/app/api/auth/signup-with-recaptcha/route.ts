import { NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password, recaptchaToken } = await request.json()

    // Validar reCAPTCHA primeiro
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'Token reCAPTCHA é obrigatório' },
        { status: 400 }
      )
    }

    const isRecaptchaValid = await validateRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Falha na verificação reCAPTCHA. Tente novamente.' },
        { status: 400 }
      )
    }

    // Se o reCAPTCHA for válido, realizar o registro através do Better Auth
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: request.headers,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Erro no registro com reCAPTCHA:', error)
    
    // Tratar erros específicos do Better Auth
    if (error.message?.includes('User already exists') || error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}