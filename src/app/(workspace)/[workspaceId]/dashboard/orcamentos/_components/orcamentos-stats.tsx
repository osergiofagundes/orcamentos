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

  const statsData = [
    {
      title: "Total de Orçamentos",
      value: stats.totalOrcamentos.toString(),
      icon: FileText,
      description: "orçamentos cadastrados",
    },
    {
      title: "Criados esta semana",
      value: stats.orcamentosUltimaSemana.toString(),
      icon: TrendingUp,
      description: "nos últimos 7 dias",
    },
    {
      title: "Valor Total (Mês)",
      value: formatCurrency(stats.valorTotalMes),
      icon: DollarSign,
      description: "orçamentos aprovados",
    },
    {
      title: "Em Rascunho",
      value: stats.orcamentosRascunho.toString(),
      icon: Clock,
      description: "aguardando finalização",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-l-4 border-l-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1" />
              <div className="h-3 bg-muted animate-pulse rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, ) => {
        return (
          <Card key={stat.title} className="border-l-8 border-l-sky-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg  flex items-center justify-center text-muted-foreground`}>
                <stat.icon className={`h-4 w-4`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
