"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CategoriesStatsProps {
  workspaceId: string
}

interface CategoryStats {
  totalCategorias: number
  categoriasComProdutos: number
  categoriasSemProdutos: number
  categoriaMaisUsada: { nome: string; quantidade: number } | null
}

export function CategoriesStats({ workspaceId }: CategoriesStatsProps) {
  const [stats, setStats] = useState<CategoryStats>({
    totalCategorias: 0,
    categoriasComProdutos: 0,
    categoriasSemProdutos: 0,
    categoriaMaisUsada: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch(`/api/workspace/${workspaceId}/categorias`),
          fetch(`/api/workspace/${workspaceId}/produtos`),
        ])

        if (categoriesResponse.ok && productsResponse.ok) {
          const categories = await categoriesResponse.json()
          const products = await productsResponse.json()

          // Calcular estatísticas
          const totalCategorias = categories.length
          
          // Contar produtos por categoria
          const categoryUsage = new Map<number, { nome: string; count: number }>()
          
          categories.forEach((cat: any) => {
            categoryUsage.set(cat.id, { nome: cat.nome, count: 0 })
          })

          products.forEach((product: any) => {
            const existing = categoryUsage.get(product.categoria_id)
            if (existing) {
              existing.count++
            }
          })

          const categoriasComProdutos = Array.from(categoryUsage.values()).filter(cat => cat.count > 0).length
          const categoriasSemProdutos = totalCategorias - categoriasComProdutos

          // Encontrar categoria mais usada
          let categoriaMaisUsada = null
          let maxCount = 0
          for (const [id, usage] of categoryUsage) {
            if (usage.count > maxCount) {
              maxCount = usage.count
              categoriaMaisUsada = { nome: usage.nome, quantidade: usage.count }
            }
          }

          setStats({
            totalCategorias,
            categoriasComProdutos,
            categoriasSemProdutos,
            categoriaMaisUsada,
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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Categorias</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCategorias}</div>
          <p className="text-xs text-muted-foreground">
            Categorias cadastradas
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Com Produtos</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.categoriasComProdutos}</div>
          <p className="text-xs text-muted-foreground">
            Categorias em uso
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Sem Produtos</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.categoriasSemProdutos}</div>
          <p className="text-xs text-muted-foreground">
            Categorias vazias
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Mais Utilizada</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          {stats.categoriaMaisUsada ? (
            <div>
              <div className="text-lg font-bold text-purple-600">{stats.categoriaMaisUsada.nome}</div>
              <p className="text-xs text-muted-foreground">
                {stats.categoriaMaisUsada.quantidade} produto{stats.categoriaMaisUsada.quantidade !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Nenhuma categoria em uso
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
