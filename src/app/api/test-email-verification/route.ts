import { NextRequest, NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email-verification"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email já está verificado" }, { status: 400 })
    }

    // Enviar email de verificação
    await sendVerificationEmail(email, user.id)

    return NextResponse.json({ 
      success: true, 
      message: "Email de verificação enviado com sucesso!" 
    })
    
  } catch (error) {
    console.error("Erro ao enviar email de verificação:", error)
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 })
  }
}