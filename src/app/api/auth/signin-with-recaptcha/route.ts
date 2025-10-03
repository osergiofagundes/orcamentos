import { NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha'
import { auth } from '@/lib/auth'

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

    const isRecaptchaValid = await validateRecaptcha(recaptchaToken)
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'Falha na verificação reCAPTCHA. Tente novamente.' },
        { status: 400 }
      )
    }

    // Se o reCAPTCHA for válido, realizar o login através do Better Auth
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: request.headers,
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Erro no login com reCAPTCHA:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}