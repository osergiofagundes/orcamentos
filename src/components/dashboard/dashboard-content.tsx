'use client'

import { StatsCard } from "@/components/dashboard/stats-card"
import { OrcamentosStatusChart } from "@/components/dashboard/orcamentos-status-chart"
import { OrcamentosMesChart } from "@/components/dashboard/orcamentos-mes-chart"
import { ProdutosServicosChart } from "@/components/dashboard/produtos-servicos-chart"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Package, FileText, CheckCircle, Clock, DollarSign, BarChart3 } from "lucide-react"

export function DashboardContent() {
  const { data, loading, error } = useDashboardData()

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Erro ao carregar dados</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3 p-6 border rounded-lg">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
            ))}
          </>
        ) : data ? (
          <>
            <StatsCard
              title="Total de Clientes"
              value={data.stats.totalClientes}
              description="Clientes cadastrados"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Produtos/Serviços"
              value={data.stats.totalProdutos}
              description="Itens cadastrados"
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Orçamentos"
              value={data.stats.totalOrcamentos}
              description="Total de orçamentos"
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Taxa de Aprovação"
              value={`${data.stats.taxaAprovacao}%`}
              description="Orçamentos aprovados"
              icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        ) : null}
      </div>

      {/* Seção adicional com mais estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3 p-6 border rounded-lg">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-3 w-[140px]" />
              </div>
            ))}
          </>
        ) : data ? (
          <>
            <StatsCard
              title="Orçamentos Aprovados"
              value={data.stats.orcamentosAprovados}
              description="Orçamentos com status aprovado"
              icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            />
            <StatsCard
              title="Orçamentos Pendentes"
              value={data.stats.orcamentosPendentes}
              description="Aguardando resposta"
              icon={<Clock className="h-4 w-4 text-yellow-600" />}
            />
            <StatsCard
              title="Valor Total Aprovado"
              value={`R$ ${data.stats.valorTotalAprovados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              description="Receita de orçamentos aprovados"
              icon={<DollarSign className="h-4 w-4 text-green-600" />}
            />
          </>
        ) : null}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
          {loading ? (
            <>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-3 p-6 border rounded-lg">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[200px]" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ))}
            </>
          ) : data ? (
            <>
              <OrcamentosStatusChart data={data.charts.orcamentosPorStatus} />
              <ProdutosServicosChart data={data.charts.produtosVsServicos} />
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="space-y-3 p-6 border rounded-lg">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[200px]" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : data ? (
          <OrcamentosMesChart data={data.charts.orcamentosPorMes} />
        ) : null}
      </div>
    </div>
  )
}
