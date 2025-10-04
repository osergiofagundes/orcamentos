import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { email } = await request.json()

    if (!email || email !== session.user.email) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe e não é do Google
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, emailVerified: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email já verificado" },
        { status: 400 }
      )
    }

    // Usar nossa função de envio manual
    try {
      const { sendVerificationEmail } = await import("@/lib/email-verification")
      
      await sendVerificationEmail(email, session.user.id)

      return NextResponse.json(
        { message: "Email de verificação reenviado com sucesso" },
        { status: 200 }
      )
    } catch (emailError) {
      console.error("Erro ao reenviar email:", emailError)
      
      return NextResponse.json(
        { error: "Erro ao enviar email. Verifique sua configuração." },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Erro ao reenviar email de verificação:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}