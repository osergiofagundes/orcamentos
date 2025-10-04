import { sendVerificationEmail } from '@/lib/email-verification'
import { prisma } from '@/lib/prisma'

// Função para testar o envio de email de verificação
export async function testEmailVerification(email: string) {
  try {
    console.log('🧪 Testando envio de email de verificação...')
    
    // Buscar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ Usuário com email ${email} não encontrado`)
      return
    }
    
    await sendVerificationEmail(email, user.id)
    
    console.log('✅ Email de verificação enviado com sucesso!')
    console.log(`📧 Verifique a caixa de entrada de: ${email}`)
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
  }
}

// Exemplo de uso:
// testEmailVerification('seu-email@exemplo.com')