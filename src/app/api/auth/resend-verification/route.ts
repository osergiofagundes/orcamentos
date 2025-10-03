import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Usar a API do Better Auth para reenviar email de verificação
    const result = await auth.api.sendVerificationEmail({
      body: { email },
      headers: request.headers,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Email de verificação enviado com sucesso' 
    })
  } catch (error: any) {
    console.error('Erro ao reenviar email de verificação:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: 'Não foi possível reenviar o email de verificação'
      },
      { status: 500 }
    )
  }
}