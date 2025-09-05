"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, TrendingUp, Package, Users, ChevronDown, ChevronUp } from "lucide-react"

interface CategoriesStatsProps {
  workspaceId: string
}

export function CategoriesStats({ workspaceId }: CategoriesStatsProps) {
  const [stats, setStats] = useState({
    totalCategorias: 0,
    categoriasUltimaSemana: 0,
    categoriasComProdutos: 0,
    categoriasSemProdutos: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/categorias`)

        if (response.ok) {
          const categorias = await response.json()

          // Calcular estatísticas
          const totalCategorias = categorias.length

          // Categorias da última semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

          const categoriasUltimaSemana = categorias.filter((categoria: any) => 
            new Date(categoria.createdAt) >= oneWeekAgo
          ).length

          // Categorias com e sem produtos
          const categoriasComProdutos = categorias.filter((categoria: any) => 
            categoria._count?.produtosServicos > 0
          ).length

          const categoriasSemProdutos = totalCategorias - categoriasComProdutos

          setStats({
            totalCategorias,
            categoriasUltimaSemana,
            categoriasComProdutos,
            categoriasSemProdutos,
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

  const statsCards = [
    {
      title: "Total de Categorias",
      value: stats.totalCategorias.toString(),
      icon: Tag,
      description: "Categorias cadastradas",
    },
    {
      title: "Novas Categorias",
      value: stats.categoriasUltimaSemana.toString(),
      icon: TrendingUp,
      description: "Última semana",
    },
    {
      title: "Com Produtos",
      value: stats.categoriasComProdutos.toString(),
      icon: Package,
      description: "Categorias utilizadas",
    },
    {
      title: "Sem Produtos",
      value: stats.categoriasSemProdutos.toString(),
      icon: Users,
      description: "Categorias vazias",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
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
  const cardsToShow = showAll ? statsCards : statsCards.slice(0, 1)

  return (
    <div className="space-y-4">
      {/* Grid dos cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Desktop: mostra todos os cards */}
        <div className="hidden md:contents">
          {statsCards.map((card, index) => (
            <Card key={index} className="border-l-8 border-l-sky-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile: mostra cards baseado no estado showAll */}
        <div className="md:hidden space-y-4">
          {cardsToShow.map((card, index) => (
            <Card key={index} className="border-l-8 border-l-sky-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
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
