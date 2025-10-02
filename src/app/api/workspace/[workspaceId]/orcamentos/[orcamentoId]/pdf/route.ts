import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; orcamentoId: string }> }
) {
  try {
    const { workspaceId, orcamentoId } = await context.params
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

    // Buscar todos os orçamentos do workspace ordenados por data de criação para determinar a posição
    const todosOrcamentos = await prisma.orcamento.findMany({
      where: {
        area_trabalho_id: parseInt(workspaceId),
      },
      select: {
        id: true,
        data_criacao: true,
      },
      orderBy: {
        data_criacao: 'asc'
      }
    })
    
    // Encontrar a posição do orçamento atual na lista
    const numeroOrcamento = todosOrcamentos.findIndex(orc => orc.id === parseInt(orcamentoId)) + 1

    // Buscar o orçamento com todos os dados necessários para o PDF
    const orcamento = await prisma.orcamento.findFirst({
      where: {
        id: parseInt(orcamentoId),
        area_trabalho_id: parseInt(workspaceId),
      },
      include: {
        usuario: {
          select: {
            name: true,
            email: true,
          },
        },
        areaTrabalho: {
          select: {
            id: true,
            nome: true,
            cpf_cnpj: true,
            telefone: true,
            email: true,
            endereco: true,
            bairro: true,
            cidade: true,
            estado: true,
            cep: true,
            logo_url: true,
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
                tipo_valor: true,
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

    // Calcular valores
    const subtotal = orcamento.itensOrcamento.reduce((acc: number, item: any) => {
      return acc + (item.quantidade * item.preco_unitario)
    }, 0)

    const totalDesconto = orcamento.itensOrcamento.reduce((acc: number, item: any) => {
      let desconto = 0
      if (item.desconto_percentual && Number(item.desconto_percentual) > 0) {
        desconto = (item.quantidade * item.preco_unitario * Number(item.desconto_percentual)) / 100
      }
      if (item.desconto_valor && item.desconto_valor > 0) {
        desconto += item.desconto_valor
      }
      return acc + desconto
    }, 0)

    const valorFinal = subtotal - totalDesconto

    const orcamentoData = {
      ...orcamento,
      numeroOrcamento,
      subtotal,
      totalDesconto,
      valorFinal,
      // Montar dados do cliente usando campos desnormalizados
      cliente: {
        id: 0, // ID não é necessário para o PDF
        nome: orcamento.cliente_nome,
        cpf_cnpj: orcamento.cliente_cpf_cnpj,
        telefone: orcamento.cliente_telefone,
        email: orcamento.cliente_email,
        endereco: orcamento.cliente_endereco,
        bairro: orcamento.cliente_bairro,
        cidade: orcamento.cliente_cidade,
        estado: orcamento.cliente_estado,
        cep: orcamento.cliente_cep,
      },
    }

    return NextResponse.json(orcamentoData)
  } catch (error) {
    console.error("Erro ao buscar dados do orçamento para PDF:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
