import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 })
    }

    // Buscar token no banco
    const verification = await prisma.verification.findFirst({
      where: {
        value: token,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!verification) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    // Decodificar o token para obter o email
    let email: string
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      email = decoded.email
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    // Verificar se o token corresponde ao email
    if (verification.identifier !== email) {
      return NextResponse.json({ error: "Token não corresponde ao email" }, { status: 400 })
    }

    // Atualizar usuário para verificado
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    })

    // Remover token usado
    await prisma.verification.delete({
      where: { id: verification.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao verificar email:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}