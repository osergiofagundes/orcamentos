"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, TrendingUp, DollarSign, Clock, ChevronDown, ChevronUp } from "lucide-react"

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
  const [showAll, setShowAll] = useState(false)

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

  // Para mobile, mostra apenas o primeiro card se showAll for false
  const cardsToShow = showAll ? statsData : statsData.slice(0, 1)

  return (
    <div className="space-y-4">
      {/* Grid dos cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Desktop: mostra todos os cards */}
        <div className="hidden md:contents">
          {statsData.map((stat) => {
            return (
              <Card key={stat.title}>
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

        {/* Mobile: mostra cards baseado no estado showAll */}
        <div className="md:hidden space-y-4">
          {cardsToShow.map((stat) => {
            return (
              <Card key={stat.title}>
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
      </div>

      {/* Botão "Mostrar mais" apenas no mobile */}
      <div className="md:hidden flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2"
        >
          {showAll ? (
            <>
              Mostrar menos
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Mostrar mais
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
