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

    // Buscar o workspace do usuário
    const userWorkspace = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        areaTrabalho: true
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const workspaceId = userWorkspace.area_trabalho_id

    // Estatísticas básicas
    const [
      totalClientes,
      totalProdutos,
      totalOrcamentos,
      orcamentosAprovados,
      orcamentosPendentes,
      valorTotalAprovados,
    ] = await Promise.all([
      prisma.cliente.count({
        where: { area_trabalho_id: workspaceId, deletedAt: null }
      }),
      prisma.produtoServico.count({
        where: { area_trabalho_id: workspaceId, deletedAt: null }
      }),
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
          status: 'ENVIADO',
          deletedAt: null 
        }
      }),
      prisma.orcamento.aggregate({
        where: { 
          area_trabalho_id: workspaceId,
          status: 'APROVADO',
          deletedAt: null
        },
        _sum: {
          valor_total: true
        }
      }),
    ])

    // Orçamentos por status
    const orcamentosPorStatus = await prisma.orcamento.groupBy({
      by: ['status'],
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null
      },
      _count: {
        id: true
      }
    })

    // Orçamentos dos últimos 6 meses
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const orcamentosPorMes = await prisma.orcamento.groupBy({
      by: ['data_criacao'],
      where: {
        area_trabalho_id: workspaceId,
        data_criacao: {
          gte: sixMonthsAgo
        },
        deletedAt: null
      },
      _count: {
        id: true
      },
      _sum: {
        valor_total: true
      }
    })

    // Agrupar por mês
    const monthsMap = new Map()
    const now = new Date()
    
    // Inicializar os últimos 6 meses com valores zerados
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      monthsMap.set(monthKey, {
        mes: monthKey,
        quantidade: 0,
        valor: 0
      })
    }

    // Preencher com dados reais
    orcamentosPorMes.forEach(orcamento => {
      const date = new Date(orcamento.data_criacao)
      const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
      
      if (monthsMap.has(monthKey)) {
        const existing = monthsMap.get(monthKey)
        existing.quantidade += orcamento._count.id
        existing.valor += (orcamento._sum.valor_total || 0) / 100 // Converter para reais
      }
    })

    const orcamentosPorMesFormatado = Array.from(monthsMap.values()).sort((a, b) => {
      const [monthA, yearA] = a.mes.split('/').map(Number)
      const [monthB, yearB] = b.mes.split('/').map(Number)
      
      if (yearA !== yearB) return yearA - yearB
      return monthA - monthB
    })

    // Top 5 produtos/serviços mais utilizados
    const topProdutos = await prisma.itemOrcamento.groupBy({
      by: ['produto_servico_id'],
      where: {
        orcamento: {
          area_trabalho_id: workspaceId,
          deletedAt: null
        }
      },
      _sum: {
        quantidade: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 5
    })

    // Buscar nomes dos produtos
    const produtoIds = topProdutos.map(item => item.produto_servico_id)
    const produtos = await prisma.produtoServico.findMany({
      where: {
        id: { in: produtoIds }
      },
      select: {
        id: true,
        nome: true,
        tipo: true
      }
    })

    const topProdutosComNomes = topProdutos.map(item => {
      const produto = produtos.find(p => p.id === item.produto_servico_id)
      return {
        ...item,
        nome: produto?.nome || 'Produto não encontrado',
        tipo: produto?.tipo || 'PRODUTO'
      }
    })

    // Produtos vs Serviços
    const produtosVsServicos = await prisma.produtoServico.groupBy({
      by: ['tipo'],
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null
      },
      _count: {
        id: true
      }
    })

    const response = {
      stats: {
        totalClientes,
        totalProdutos,
        totalOrcamentos,
        orcamentosAprovados,
        orcamentosPendentes,
        valorTotalAprovados: (valorTotalAprovados._sum.valor_total || 0) / 100, // Converter de centavos para reais
        taxaAprovacao: totalOrcamentos > 0 ? ((orcamentosAprovados / totalOrcamentos) * 100).toFixed(1) : '0'
      },
      charts: {
        orcamentosPorStatus: orcamentosPorStatus.map(item => ({
          status: item.status,
          quantidade: item._count.id
        })),
        orcamentosPorMes: orcamentosPorMesFormatado,
        topProdutos: topProdutosComNomes,
        produtosVsServicos: produtosVsServicos.map(item => ({
          tipo: item.tipo,
          quantidade: item._count.id
        }))
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
