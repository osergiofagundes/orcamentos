import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Buscar as permissões do usuário no workspace
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      nivel_permissao: userAccess.nivel_permissao,
      usuario_id: userAccess.usuario_id,
      area_trabalho_id: userAccess.area_trabalho_id,
    })
  } catch (error) {
    console.error("Erro ao buscar permissões do usuário:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
