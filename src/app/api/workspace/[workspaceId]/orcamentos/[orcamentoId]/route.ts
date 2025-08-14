import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; orcamentoId: string }> }
) {
  try {
    const { workspaceId, orcamentoId } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem acesso ao workspace
    const userWorkspace = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Buscar o orçamento específico
    const orcamento = await prisma.orcamento.findFirst({
      where: {
        id: parseInt(orcamentoId),
        area_trabalho_id: parseInt(workspaceId),
      },
      include: {
        cliente: {
          select: {
            nome: true,
            cpf_cnpj: true,
            email: true,
            telefone: true,
            endereco: true,
          },
        },
        usuario: {
          select: {
            name: true,
            email: true,
          },
        },
        itensOrcamento: {
          include: {
            produtoServico: {
              select: {
                nome: true,
                descricao: true,
              },
            },
          },
        },
      },
    })

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(orcamento)
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
