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
      select: {
        id: true,
        data_criacao: true,
        valor_total: true,
        status: true,
        observacoes: true,
        // Usar dados desnormalizados do cliente
        cliente_nome: true,
        cliente_cpf_cnpj: true,
        cliente_telefone: true,
        cliente_email: true,
        cliente_endereco: true,
        cliente_bairro: true,
        cliente_cidade: true,
        cliente_estado: true,
        cliente_cep: true,
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
    const { clienteId, observacoes, itens } = body

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
      const subtotal = item.quantidade * item.precoUnitario * 100 // Convert to cents
      let desconto = 0
      
      if (item.tipoDesconto === "percentual" && item.descontoPercentual > 0) {
        desconto = subtotal * (item.descontoPercentual / 100)
      } else if (item.tipoDesconto === "valor" && item.descontoValor > 0) {
        desconto = item.descontoValor * 100 // Convert to cents
      }
      
      valorTotal += Math.max(0, Math.round(subtotal - desconto))
    }

    // Criar orçamento e itens em transação
    const orcamento = await prisma.$transaction(async (tx) => {
      // Criar o orçamento com dados desnormalizados do cliente
      const novoOrcamento = await tx.orcamento.create({
        data: {
          cliente_id: parseInt(clienteId),
          usuario_id: session.user.id,
          area_trabalho_id: parseInt(workspaceId),
          valor_total: valorTotal,
          status: "RASCUNHO",
          observacoes: observacoes || null,
          // Desnormalizar dados do cliente para preservação
          cliente_nome: cliente.nome,
          cliente_cpf_cnpj: cliente.cpf_cnpj,
          cliente_telefone: cliente.telefone,
          cliente_email: cliente.email,
          cliente_endereco: cliente.endereco,
          cliente_bairro: cliente.bairro,
          cliente_cidade: cliente.cidade,
          cliente_estado: cliente.estado,
          cliente_cep: cliente.cep,
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
            desconto_percentual: item.tipoDesconto === "percentual" ? item.descontoPercentual || 0 : 0,
            desconto_valor: item.tipoDesconto === "valor" ? Math.round((item.descontoValor || 0) * 100) : 0, // Convert to cents
            // Desnormalizar dados do produto para preservação
            produto_nome: produto.nome,
            produto_tipo: produto.tipo,
            produto_tipo_valor: produto.tipo_valor,
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
