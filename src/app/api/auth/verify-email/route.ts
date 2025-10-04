import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token de verificação é obrigatório" },
        { status: 400 }
      )
    }

    // Buscar verificação no banco de dados
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: {
          gte: new Date()
        }
      }
    })

    if (!verification) {
      return NextResponse.json(
        { error: "Token de verificação inválido ou expirado" },
        { status: 400 }
      )
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: {
        email: verification.identifier
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar usuário como verificado
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        emailVerified: true
      }
    })

    // Remover token de verificação usado
    await prisma.verification.delete({
      where: {
        id: verification.id
      }
    })

    return NextResponse.json(
      { message: "Email verificado com sucesso!" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Erro ao processar verificação de email:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}