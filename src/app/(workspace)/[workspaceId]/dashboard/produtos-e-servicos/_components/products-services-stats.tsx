"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, DollarSign, FileText } from "lucide-react"

interface ProductsServicesStatsProps {
  workspaceId: string
}

export function ProductsServicesStats({ workspaceId }: ProductsServicesStatsProps) {
  const [stats, setStats] = useState({
    totalProdutosServicos: 0,
    novosEstaSemana: 0,
    valorMedio: 0,
    quantidadeOrcados: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsResponse, budgetsResponse] = await Promise.all([
          fetch(`/api/workspace/${workspaceId}/produtos`),
          fetch(`/api/workspace/${workspaceId}/orcamentos`),
        ])

        if (productsResponse.ok) {
          const products = await productsResponse.json()

          // Total de produtos/serviços
          const totalProdutosServicos = products.length

          // Novos esta semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const novosEstaSemana = products.filter((product: any) => 
            new Date(product.createdAt) >= oneWeekAgo
          ).length

          // Valor médio
          const produtosComValor = products.filter((product: any) => product.valor && product.valor > 0)
          const valorMedio = produtosComValor.length > 0 
            ? produtosComValor.reduce((sum: number, product: any) => sum + (product.valor || 0), 0) / produtosComValor.length
            : 0

          // Quantidade de produtos já orçados
          let quantidadeOrcados = 0
          if (budgetsResponse.ok) {
            const budgets = await budgetsResponse.json()
            const produtosOrcados = new Set()
            budgets.forEach((budget: any) => {
              if (budget.itens) {
                budget.itens.forEach((item: any) => {
                  if (item.produto_servico_id) {
                    produtosOrcados.add(item.produto_servico_id)
                  }
                })
              }
            })
            quantidadeOrcados = produtosOrcados.size
          }

          setStats({
            totalProdutosServicos,
            novosEstaSemana,
            valorMedio,
            quantidadeOrcados,
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
      currency: 'BRL',
    }).format(value / 100)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
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
          <CardTitle className="text-sm font-medium">Total de Produtos/Serviços</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProdutosServicos}</div>
          <p className="text-xs text-muted-foreground">
            Itens cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Esta Semana</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.novosEstaSemana}</div>
          <p className="text-xs text-muted-foreground">
            Nos últimos 7 dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.valorMedio)}</div>
          <p className="text-xs text-muted-foreground">
            Por produto/serviço
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produtos Orçados</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.quantidadeOrcados}</div>
          <p className="text-xs text-muted-foreground">
            Já utilizados em orçamentos
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
