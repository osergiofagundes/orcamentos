import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { render } from '@react-email/render'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { ResetPasswordEmail } from '@/emails/reset-password-email'

const resend = new Resend(process.env.RESEND_API_KEY)

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
})

export async function POST(request: NextRequest) {
  console.log('🚀 INICIANDO FORGOT PASSWORD - endpoint chamado')
  
  try {
    const body = await request.json()
    console.log('📨 Email recebido para reset:', body.email)
    
    // Validar dados de entrada
    const { email } = forgotPasswordSchema.parse(body)

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    console.log('🔍 Resultado da busca do usuário:', {
      usuarioEncontrado: !!user,
      email: user?.email || 'N/A',
      id: user?.id || 'N/A'
    })

    // Por segurança, sempre retornamos sucesso, mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      console.log('⚠️ Usuário não encontrado, mas retornando sucesso por segurança')
      return NextResponse.json({ 
        success: true, 
        message: "Se o email estiver cadastrado, você receberá as instruções de redefinição de senha." 
      })
    }

    // Gerar token de reset único
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    console.log('🔐 Token gerado:', {
      tokenPreview: resetToken.substring(0, 10) + '...',
      tokenLength: resetToken.length,
      expiracao: resetTokenExpiry.toISOString(),
      tempoVida: '1 hora'
    })

    // Salvar token no banco de dados
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    console.log('✅ Token salvo no banco de dados para usuário:', updatedUser.email)

    // Gerar URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`

    console.log('🔗 URL de reset gerada:', resetUrl)

    // Renderizar o template de email
    const emailHtml = await render(ResetPasswordEmail({
      userEmail: email,
      resetPasswordUrl: resetUrl,
    }))

    // Enviar email
    const emailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@skyorcamentos.com',
      to: email,
      subject: 'Redefinir senha - Sky Orçamentos',
      html: emailHtml,
    })

    console.log('📧 Email enviado:', {
      sucesso: !!emailResult.data,
      emailId: emailResult.data?.id || 'N/A',
      erro: emailResult.error || 'Nenhum'
    })

    console.log('🎉 FORGOT PASSWORD CONCLUÍDO COM SUCESSO para:', email)

    return NextResponse.json({ 
      success: true, 
      message: "Se o email estiver cadastrado, você receberá as instruções de redefinição de senha." 
    })

  } catch (error) {
    console.error('❌ ERRO no forgot password:', error)

    if (error instanceof z.ZodError) {
      console.log('❌ Erro de validação:', error.errors)
      return NextResponse.json(
        { success: false, message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}