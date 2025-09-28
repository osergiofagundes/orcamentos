import { prisma } from '@/lib/prisma';

/**
 * Database optimization recommendations to reduce data transfer usage
 * 
 * Current Issues:
 * 1. Multiple separate queries instead of combining them
 * 2. Counting queries that could be combined with groupBy
 * 3. No caching mechanism for frequently accessed data
 * 4. Fetching unnecessary fields in some queries
 * 
 * Optimizations:
 */

type OrcamentoStat = {
  status: string;
  _count: { id: number };
  _sum: { valor_total: number | null };
};

// 1. Combine multiple count queries into a single aggregate query
export async function getOptimizedDashboardStats(workspaceId: number) {
  // Instead of 6 separate queries, use a single groupBy query
  const orcamentoStats = await prisma.orcamento.groupBy({
    by: ['status'],
    where: {
      area_trabalho_id: workspaceId,
      deletedAt: null
    },
    _count: {
      id: true
    },
    _sum: {
      valor_total: true
    }
  });

  // Calculate derived stats from the grouped result
  const totalOrcamentos = orcamentoStats.reduce((sum: number, stat: OrcamentoStat) => sum + stat._count.id, 0);
  const aprovados = orcamentoStats.find((s: OrcamentoStat) => s.status === 'APROVADO')?._count.id || 0;
  const pendentes = orcamentoStats.find((s: OrcamentoStat) => s.status === 'ENVIADO')?._count.id || 0;
  const valorTotal = orcamentoStats.find((s: OrcamentoStat) => s.status === 'APROVADO')?._sum.valor_total || 0;

  // Still need separate queries for clients and products, but optimized
  const [totalClientes, totalProdutos] = await Promise.all([
    prisma.cliente.count({
      where: { area_trabalho_id: workspaceId, deletedAt: null }
    }),
    prisma.produtoServico.count({
      where: { area_trabalho_id: workspaceId, deletedAt: null }
    })
  ]);

  return {
    totalClientes,
    totalProdutos,
    totalOrcamentos,
    aprovados,
    pendentes,
    valorTotal,
    orcamentoStats // Can be reused for charts
  };
}

// 2. Implement caching for dashboard data (Redis or in-memory)
export async function getCachedDashboardStats(workspaceId: number) {
  const cacheKey = `dashboard_stats_${workspaceId}`;
  const cacheTTL = 5 * 60; // 5 minutes
  
  // Check cache first (implement with Redis or similar)
  // const cached = await redis.get(cacheKey);
  // if (cached) return JSON.parse(cached);
  
  const stats = await getOptimizedDashboardStats(workspaceId);
  
  // Cache the result
  // await redis.setex(cacheKey, cacheTTL, JSON.stringify(stats));
  
  return stats;
}

// 3. Optimize chart queries with better date handling
export async function getOptimizedChartData(workspaceId: number) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1); // Start from first day of month
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Use more efficient date grouping
  const orcamentosPorMes = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', data_criacao) as mes,
      COUNT(*) as quantidade,
      SUM(valor_total) as valor
    FROM "Orcamento"
    WHERE area_trabalho_id = ${workspaceId}
      AND data_criacao >= ${sixMonthsAgo}
      AND "deletedAt" IS NULL
    GROUP BY DATE_TRUNC('month', data_criacao)
    ORDER BY mes
  `;

  return orcamentosPorMes;
}

// 4. Limit fields in queries - only select what's needed
export async function getOptimizedTopProducts(workspaceId: number) {
  return prisma.itemOrcamento.groupBy({
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
    take: 10 // Limit to top 10 instead of fetching all
  });
}