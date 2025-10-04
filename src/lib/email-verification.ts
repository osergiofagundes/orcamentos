import { Resend } from "resend"
import { render } from "@react-email/render"
import { EmailVerificationEmail } from "@/emails/email-verification-email"
import { prisma } from "./prisma"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(userEmail: string, userId: string) {
  try {
    console.log(`📧 Enviando email de verificação manual para: ${userEmail}`)
    
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não configurada!')
      throw new Error('RESEND_API_KEY não configurada')
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Salvar token no banco
    await prisma.verification.create({
      data: {
        id: crypto.randomUUID(),
        identifier: userEmail,
        value: token,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    })

    // Gerar URL de verificação
    const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${token}`
    console.log(`🔗 URL de verificação: ${verificationUrl}`)

    // Renderizar email
    const emailHtml = await render(EmailVerificationEmail({
      userEmail,
      verificationUrl,
    }))

    // Enviar email
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@skyorcamentos.com',
      to: userEmail,
      subject: 'Verificar email - Sky Orçamentos',
      html: emailHtml,
    })

    console.log('✅ Email de verificação manual enviado com sucesso:', result)
    return { success: true, token }
  } catch (error) {
    console.error('❌ Erro ao enviar email de verificação manual:', error)
    throw error
  }
}