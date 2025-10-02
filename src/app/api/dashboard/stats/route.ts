import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDatabaseQuotaError } from '@/lib/database-error-handler'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter workspaceId dos query params
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
      },
      include: {
        areaTrabalho: true
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Acesso negado ao workspace' }, { status: 403 })
    }

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

    // Últimos 10 clientes adicionados
    const recentClientes = await prisma.cliente.findMany({
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf_cnpj: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Últimos 10 produtos/serviços adicionados
    const recentProducts = await prisma.produtoServico.findMany({
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
        valor: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Últimos 5 orçamentos adicionados
    const recentOrcamentos = await prisma.orcamento.findMany({
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null
      },
      select: {
        id: true,
        valor_total: true,
        status: true,
        createdAt: true,
        // Usar dados desnormalizados do cliente
        cliente_nome: true,
        usuario: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            itensOrcamento: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
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
      },
      recentClients: recentClientes.map(client => ({
        id: client.id,
        nome: client.nome,
        email: client.email,
        telefone: client.telefone,
        cpf_cnpj: client.cpf_cnpj,
        data_criacao: client.createdAt
      })),
      recentProducts: recentProducts.map(product => ({
        id: product.id,
        nome: product.nome,
        tipo: product.tipo,
        valor: (product.valor || 0) / 100, // Converter de centavos para reais
        data_criacao: product.createdAt
      })),
      recentOrcamentos: recentOrcamentos.map(orcamento => ({
        id: orcamento.id,
        cliente_nome: orcamento.cliente_nome,
        valor_total: (orcamento.valor_total || 0) / 100, // Converter de centavos para reais
        status: orcamento.status,
        data_criacao: orcamento.createdAt,
        responsavel: orcamento.usuario.name,
        itens_count: orcamento._count.itensOrcamento
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    
    if (isDatabaseQuotaError(error)) {
      return NextResponse.json(
        { error: 'Your project has exceeded the data transfer quota. Upgrade your plan to increase limits.' },
        { status: 503 } // Service Unavailable
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
