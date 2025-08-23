"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp, DollarSign, Clock } from "lucide-react"

interface OrcamentosStatsProps {
  workspaceId: string
}

export function OrcamentosStats({ workspaceId }: OrcamentosStatsProps) {
  const [stats, setStats] = useState({
    totalOrcamentos: 0,
    orcamentosUltimaSemana: 0,
    valorTotalMes: 0,
    orcamentosRascunho: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/orcamentos`)

        if (response.ok) {
          const orcamentos = await response.json()

          // Calcular estatísticas
          const totalOrcamentos = orcamentos.length

          // Orçamentos da última semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const orcamentosUltimaSemana = orcamentos.filter((orcamento: any) => 
            new Date(orcamento.data_criacao) >= oneWeekAgo
          ).length

          // Valor total do mês atual
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          const valorTotalMes = orcamentos
            .filter((orcamento: any) => {
              const orcamentoDate = new Date(orcamento.data_criacao)
              return orcamentoDate.getMonth() === currentMonth && 
                     orcamentoDate.getFullYear() === currentYear &&
                     orcamento.status === "APROVADO"
            })
            .reduce((sum: number, orcamento: any) => sum + (orcamento.valor_total || 0), 0)

          // Orçamentos em rascunho
          const orcamentosRascunho = orcamentos.filter((orcamento: any) => 
            orcamento.status === "RASCUNHO"
          ).length

          setStats({
            totalOrcamentos,
            orcamentosUltimaSemana,
            valorTotalMes,
            orcamentosRascunho,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [workspaceId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100) // Converter de centavos para reais
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Orçamentos
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrcamentos}</div>
          <p className="text-xs text-muted-foreground">
            orçamentos cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Criados esta semana
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.orcamentosUltimaSemana}</div>
          <p className="text-xs text-muted-foreground">
            nos últimos 7 dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Total (Mês)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.valorTotalMes)}</div>
          <p className="text-xs text-muted-foreground">
            orçamentos aprovados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Em Rascunho
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.orcamentosRascunho}</div>
          <p className="text-xs text-muted-foreground">
            aguardando finalização
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
