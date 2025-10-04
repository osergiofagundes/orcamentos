import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
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

    try {
      // Usar a API do Better Auth para verificar o email
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/verify-email`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...Object.fromEntries(await headers())
        }
      })

      if (response.ok) {
        return NextResponse.json(
          { message: "Email verificado com sucesso!" },
          { status: 200 }
        )
      } else {
        const errorData = await response.text()
        console.error("Erro do Better Auth:", errorData)
        return NextResponse.json(
          { error: "Token de verificação inválido ou expirado" },
          { status: 400 }
        )
      }
    } catch (authError) {
      console.error("Erro ao verificar com Better Auth:", authError)
      return NextResponse.json(
        { error: "Erro ao verificar token" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Erro ao processar verificação de email:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}