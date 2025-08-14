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
            id: true,
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
                id: true,
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

export async function PUT(
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

    // Verificar se o orçamento pode ser editado (apenas RASCUNHO e ENVIADO)
    if (!["RASCUNHO", "ENVIADO"].includes(existingOrcamento.status)) {
      return NextResponse.json(
        { error: "Este orçamento não pode ser editado" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { clienteId, observacoes, itens } = body

    // Validar se o cliente existe no workspace
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: parseInt(clienteId),
        area_trabalho_id: parseInt(workspaceId),
        deletedAt: null,
      },
    })

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 400 }
      )
    }

    // Calcular valor total
    const valorTotal = itens.reduce((total: number, item: any) => {
      return total + (item.quantidade * Math.round(item.precoUnitario * 100))
    }, 0)

    // Atualizar orçamento e itens em transação
    const orcamentoAtualizado = await prisma.$transaction(async (tx) => {
      // Atualizar o orçamento
      const orcamento = await tx.orcamento.update({
        where: { id: parseInt(orcamentoId) },
        data: {
          cliente_id: parseInt(clienteId),
          valor_total: valorTotal,
          observacoes: observacoes || null,
        },
      })

      // Remover todos os itens existentes
      await tx.itemOrcamento.deleteMany({
        where: { orcamento_id: parseInt(orcamentoId) },
      })

      // Criar os novos itens
      for (const item of itens) {
        // Verificar se o produto/serviço existe no workspace
        const produto = await tx.produtoServico.findFirst({
          where: {
            id: parseInt(item.produtoServicoId),
            area_trabalho_id: parseInt(workspaceId),
            deletedAt: null,
          },
        })

        if (!produto) {
          throw new Error(`Produto/serviço com ID ${item.produtoServicoId} não encontrado`)
        }

        await tx.itemOrcamento.create({
          data: {
            orcamento_id: parseInt(orcamentoId),
            produto_servico_id: parseInt(item.produtoServicoId),
            quantidade: item.quantidade,
            preco_unitario: Math.round(item.precoUnitario * 100), // Convert to cents
          },
        })
      }

      // Retornar o orçamento atualizado com relacionamentos
      return await tx.orcamento.findUnique({
        where: { id: parseInt(orcamentoId) },
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
            include: {
              produtoServico: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      })
    })

    return NextResponse.json(orcamentoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar orçamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verificar se o orçamento pode ser excluído (apenas RASCUNHO e ENVIADO)
    if (!["RASCUNHO", "ENVIADO"].includes(existingOrcamento.status)) {
      return NextResponse.json(
        { error: "Este orçamento não pode ser excluído" },
        { status: 400 }
      )
    }

    // Excluir orçamento e itens em transação
    await prisma.$transaction(async (tx) => {
      // Primeiro, excluir todos os itens do orçamento
      await tx.itemOrcamento.deleteMany({
        where: { orcamento_id: parseInt(orcamentoId) },
      })

      // Depois, excluir o orçamento
      await tx.orcamento.delete({
        where: { id: parseInt(orcamentoId) },
      })
    })

    return NextResponse.json({ 
      message: "Orçamento excluído com sucesso",
      success: true 
    })
  } catch (error) {
    console.error("Erro ao excluir orçamento:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
