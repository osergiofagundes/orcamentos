import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { recaptchaToken } = await request.json()

    if (!recaptchaToken) {
      return NextResponse.json({ error: 'Token reCAPTCHA necessário' }, { status: 400 })
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY

    if (!secretKey) {
      return NextResponse.json({ 
        error: 'Chave secreta reCAPTCHA não configurada',
        hasSecret: false
      }, { status: 500 })
    }

    console.log('[RECAPTCHA_TEST] Testando reCAPTCHA...')

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: recaptchaToken,
      }),
    })

    const result = await response.json()

    console.log('[RECAPTCHA_TEST] Resultado:', result)

    return NextResponse.json({
      success: true,
      recaptchaResult: result,
      hasSecret: true,
      secretLength: secretKey.length,
    })

  } catch (error) {
    console.error('[RECAPTCHA_TEST] Erro:', error)
    return NextResponse.json({ 
      error: 'Erro interno no teste reCAPTCHA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}