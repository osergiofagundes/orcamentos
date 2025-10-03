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
    
    // Se o reCAPTCHA for válido, fazer requisição direta ao endpoint do Better Auth
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

    const result = await authResponse.text()
    console.log('Better Auth response status:', authResponse.status)
    console.log('Better Auth response:', result)

    if (!authResponse.ok) {
      let errorMessage = 'Credenciais inválidas'
      try {
        const errorData = JSON.parse(result)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // Se não conseguir fazer parse, usar a mensagem padrão
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: authResponse.status }
      )
    }

    // Parse the successful response
    let parsedResult
    try {
      parsedResult = JSON.parse(result)
    } catch (e) {
      parsedResult = result
    }

    return NextResponse.json({ success: true, data: parsedResult })
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