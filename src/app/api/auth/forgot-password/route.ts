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
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const { email } = forgotPasswordSchema.parse(body)

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Por segurança, sempre retornamos sucesso, mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: "Se o email estiver cadastrado, você receberá as instruções de redefinição de senha." 
      })
    }

    // Gerar token de reset único
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco de dados
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Gerar URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`

    // Renderizar o template de email
    const emailHtml = await render(ResetPasswordEmail({
      userEmail: email,
      resetPasswordUrl: resetUrl,
    }))

    // Enviar email
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@skyorcamentos.com',
      to: email,
      subject: 'Redefinir senha - Sky Orçamentos',
      html: emailHtml,
    })

    return NextResponse.json({ 
      success: true, 
      message: "Se o email estiver cadastrado, você receberá as instruções de redefinição de senha." 
    })

  } catch (error) {
    console.error('Erro ao processar forgot password:', error)

    if (error instanceof z.ZodError) {
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