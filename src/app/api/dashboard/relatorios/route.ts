import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceIdParam = searchParams.get('workspaceId')

    if (!workspaceIdParam) {
      return NextResponse.json({ error: 'workspaceId é obrigatório' }, { status: 400 })
    }

    const workspaceId = parseInt(workspaceIdParam)

    // Verificar se o usuário tem acesso ao workspace
    const userWorkspace = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: workspaceId
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Acesso negado ao workspace' }, { status: 403 })
    }

    // 1. RESUMO DE ORÇAMENTOS
    const [
      totalOrcamentos,
      orcamentosAprovados,
      orcamentosRejeitados,
      orcamentosPendentes,
    ] = await Promise.all([
      prisma.orcamento.count({
        where: { area_trabalho_id: workspaceId, deletedAt: null }
      }),
      prisma.orcamento.count({
        where: { 
          area_trabalho_id: workspaceId, 
          status: 'APROVADO',
          deletedAt: null 
        }
      }),
      prisma.orcamento.count({
        where: { 
          area_trabalho_id: workspaceId, 
          status: 'REJEITADO',
          deletedAt: null 
        }
      }),
      prisma.orcamento.count({
        where: { 
          area_trabalho_id: workspaceId, 
          status: 'ENVIADO',
          deletedAt: null 
        }
      }),
    ])

    const resumoOrcamentos = {
      total: totalOrcamentos,
      aprovados: orcamentosAprovados,
      rejeitados: orcamentosRejeitados,
      pendentes: orcamentosPendentes,
    }

    // 2. ORÇAMENTOS POR CLIENTE
    const orcamentosPorCliente = await prisma.orcamento.groupBy({
      by: ['cliente_id', 'cliente_nome'],
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null,
        cliente_id: { not: null }
      },
      _count: {
        id: true
      },
      _sum: {
        valor_total: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10 // Top 10 clientes
    })

    const orcamentosPorClienteFormatted = orcamentosPorCliente.map(item => ({
      clienteId: item.cliente_id,
      clienteNome: item.cliente_nome,
      quantidadeOrcamentos: item._count.id,
      valorTotal: item._sum.valor_total || 0
    }))

    // 3. PRODUTOS/SERVIÇOS MAIS ORÇADOS
    const produtosMaisOrcados = await prisma.itemOrcamento.groupBy({
      by: ['produto_servico_id', 'produto_nome'],
      where: {
        orcamento: {
          area_trabalho_id: workspaceId,
          deletedAt: null
        },
        produto_servico_id: { not: null }
      },
      _count: {
        id: true
      },
      _sum: {
        quantidade: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10 // Top 10 produtos/serviços
    })

    const produtosMaisOrcadosFormatted = produtosMaisOrcados.map(item => ({
      produtoId: item.produto_servico_id,
      produtoNome: item.produto_nome,
      vezesOrcado: item._count.id,
      quantidadeTotal: item._sum.quantidade || 0
    }))

    return NextResponse.json({
      resumoOrcamentos,
      orcamentosPorCliente: orcamentosPorClienteFormatted,
      produtosMaisOrcados: produtosMaisOrcadosFormatted
    })

  } catch (error) {
    console.error('Erro ao buscar relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
