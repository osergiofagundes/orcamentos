'use client'

import { StatsCard } from "@/components/dashboard/stats-card"
import { OrcamentosStatusChart } from "@/components/dashboard/orcamentos-status-chart"
import { OrcamentosMesChart } from "@/components/dashboard/orcamentos-mes-chart"
import { ProdutosServicosChart } from "@/components/dashboard/produtos-servicos-chart"
import { RecentClientsTable } from "@/components/dashboard/recent-clients-table"
import { RecentProductsTable } from "@/components/dashboard/recent-products-table"
import { RecentOrcamentosTable } from "@/components/dashboard/recent-orcamentos-table"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Package, FileText, CheckCircle, Clock, DollarSign, BarChart3 } from "lucide-react"
import { authClient } from "@/lib/auh-client"

interface DashboardContentProps {
  workspaceId: string
}

export function DashboardContent({ workspaceId }: DashboardContentProps) {
  const { data, loading, error } = useDashboardData()
  const { data: session } = authClient.useSession()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <>
      <div className='space-y-1 px-6 pb-2'>
        <h1 className="text-3xl font-bold tracking-tight">
          {loading ? 'Boa noite!' : `${getGreeting()}, ${session?.user?.name?.split(' ')[0]}!`}
        </h1>
        <p className="hidden text-muted-foreground sm:block">
          Acompanhe as métricas principais do seu negócio
        </p>
      </div>
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

        {/* Tabelas de Últimos Adicionados */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {loading ? (
            <>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-3 p-6 border rounded-lg">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[200px]" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <Skeleton key={j} className="h-8 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : data ? (
            <>
              <RecentClientsTable clients={data.recentClients} workspaceId={workspaceId} />
              <RecentProductsTable products={data.recentProducts} workspaceId={workspaceId} />
            </>
          ) : null}
        </div>

        {/* Tabela de Últimos Orçamentos */}
        <div className="w-full">
          {loading ? (
            <div className="space-y-3 p-6 border rounded-lg">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[200px]" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ) : data ? (
            <RecentOrcamentosTable orcamentos={data.recentOrcamentos} workspaceId={workspaceId} />
          ) : null}
        </div>

        {/* Gráficos - só aparecem quando há orçamentos cadastrados */}
        {!loading && data && data.stats.totalOrcamentos > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <OrcamentosStatusChart data={data.charts.orcamentosPorStatus} />
                <ProdutosServicosChart data={data.charts.produtosVsServicos} />
              </div>
            </div>

            <div className="grid gap-4">
              <OrcamentosMesChart data={data.charts.orcamentosPorMes} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
