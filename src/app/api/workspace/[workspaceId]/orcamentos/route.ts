import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
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

    const orcamentos = await prisma.orcamento.findMany({
      where: {
        area_trabalho_id: parseInt(workspaceId),
        deletedAt: null,
      },
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
      orderBy: {
        data_criacao: "desc",
      },
    })

    return NextResponse.json(orcamentos)
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
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
    const { clienteId, itens } = body

    // Validar dados
    if (!clienteId || !itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      )
    }

    // Verificar se o cliente existe no workspace
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
        { status: 404 }
      )
    }

    // Calcular valor total
    let valorTotal = 0
    for (const item of itens) {
      valorTotal += Math.round(item.quantidade * item.precoUnitario * 100) // Convert to cents
    }

    // Criar orçamento e itens em transação
    const orcamento = await prisma.$transaction(async (tx) => {
      // Criar o orçamento
      const novoOrcamento = await tx.orcamento.create({
        data: {
          cliente_id: parseInt(clienteId),
          usuario_id: session.user.id,
          area_trabalho_id: parseInt(workspaceId),
          valor_total: valorTotal,
          status: "RASCUNHO",
        },
      })

      // Criar os itens do orçamento
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
          throw new Error(`Produto/serviço não encontrado: ${item.produtoServicoId}`)
        }

        await tx.itemOrcamento.create({
          data: {
            orcamento_id: novoOrcamento.id,
            produto_servico_id: parseInt(item.produtoServicoId),
            quantidade: item.quantidade,
            preco_unitario: Math.round(item.precoUnitario * 100), // Convert to cents
          },
        })
      }

      return novoOrcamento
    })

    return NextResponse.json(orcamento, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar orçamento:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Erro interno do servidor" 
      },
      { status: 500 }
    )
  }
}
