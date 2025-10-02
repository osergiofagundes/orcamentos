import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function PATCH(
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

    const body = await request.json()
    const { status } = body

    // Validar o status
    const validStatuses = ["RASCUNHO", "ENVIADO", "APROVADO", "REJEITADO", "CANCELADO"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido" },
        { status: 400 }
      )
    }

    // Verificar se o orçamento existe e pertence ao workspace
    const existingOrcamento = await prisma.orcamento.findFirst({
      where: {
        id: parseInt(orcamentoId),
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!existingOrcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      )
    }

    // Atualizar apenas o status
    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: parseInt(orcamentoId) },
      data: { status: status as any },
      include: {
        cliente: {
          select: {
            nome: true,
            cpf_cnpj: true,
          },
        },
        usuario: {
          select: {
            name: true,
          },
        },
        itensOrcamento: {
          select: {
            id: true,
            quantidade: true,
            preco_unitario: true,
            desconto_percentual: true,
            desconto_valor: true,
            // Dados desnormalizados (sempre presentes)
            produto_nome: true,
            produto_tipo: true,
            produto_tipo_valor: true,
            // Relação opcional (pode ser null se produto foi excluído)
            produtoServico: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(orcamentoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar status do orçamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
