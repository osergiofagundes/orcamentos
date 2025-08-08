"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, DollarSign, Tag } from "lucide-react"

interface ProductsStatsProps {
  workspaceId: string
}

export function ProductsStats({ workspaceId }: ProductsStatsProps) {
  const [stats, setStats] = useState({
    totalProdutos: 0,
    produtosEssaSemana: 0,
    valorMedio: 0,
    totalCategorias: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/workspace/${workspaceId}/produtos`),
          fetch(`/api/workspace/${workspaceId}/categorias`),
        ])

        if (productsResponse.ok && categoriesResponse.ok) {
          const products = await productsResponse.json()
          const categories = await categoriesResponse.json()

          // Calcular estatísticas
          const totalProdutos = products.length
          const totalCategorias = categories.length

          // Produtos da última semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const produtosEssaSemana = products.filter((product: any) => 
            new Date(product.createdAt) >= oneWeekAgo
          ).length

          // Valor médio
          const produtosComValor = products.filter((product: any) => product.valor && product.valor > 0)
          const valorMedio = produtosComValor.length > 0 
            ? produtosComValor.reduce((sum: number, product: any) => sum + (product.valor || 0), 0) / produtosComValor.length
            : 0

          setStats({
            totalProdutos,
            produtosEssaSemana,
            valorMedio,
            totalCategorias,
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

  const statsData = [
    {
      title: "Total de Produtos/Serviços",
      value: stats.totalProdutos.toString(),
      icon: Package,
      description: "Itens cadastrados",
    },
    {
      title: "Novos esta semana",
      value: stats.produtosEssaSemana.toString(),
      icon: TrendingUp,
      description: "Últimos 7 dias",
    },
    {
      title: "Valor Médio",
      value: formatCurrency(stats.valorMedio),
      icon: DollarSign,
      description: "Por produto/serviço",
    },
    {
      title: "Categorias",
      value: stats.totalCategorias.toString(),
      icon: Tag,
      description: "Categorias ativas",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
        const colors = [
          { border: "border-l-blue-500", bg: "bg-blue-100", dot: "bg-blue-500", text: "text-blue-600" },
          { border: "border-l-green-500", bg: "bg-green-100", dot: "bg-green-500", text: "text-green-600" },
          { border: "border-l-purple-500", bg: "bg-purple-100", dot: "bg-purple-500", text: "text-purple-600" },
          { border: "border-l-orange-500", bg: "bg-orange-100", dot: "bg-orange-500", text: "text-orange-600" },
        ]
        const color = colors[index % colors.length]
        
        return (
          <Card key={stat.title} className={`${color.border} border-l-4`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${color.dot.replace('bg-', 'text-')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${index === 0 ? '' : color.text}`}>
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
