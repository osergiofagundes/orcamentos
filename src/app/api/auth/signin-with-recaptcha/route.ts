import { NextResponse } from 'next/server'
import { validateRecaptcha } from '@/lib/recaptcha'

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

    console.log('reCAPTCHA validation successful, attempting login with Better Auth...')
    
    // Tentar usar o Better Auth diretamente
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

    const responseText = await authResponse.text()
    console.log('Better Auth response status:', authResponse.status)
    console.log('Better Auth response body:', responseText)

    if (authResponse.ok) {
      try {
        const result = JSON.parse(responseText)
        return NextResponse.json({ 
          success: true, 
          data: result
        })
      } catch (parseError) {
        console.log('Parse error, returning raw response')
        return NextResponse.json({ 
          success: true, 
          data: { message: 'Login successful', raw: responseText }
        })
      }
    } else {
      // Se o Better Auth retornar erro, vamos analisar o que está acontecendo
      console.log('Better Auth failed with status:', authResponse.status)
      
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { error: responseText }
      }
      
      // Retornar o erro específico do Better Auth
      return NextResponse.json(
        { error: errorData.error || errorData.message || 'Credenciais inválidas' },
        { status: authResponse.status }
      )
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