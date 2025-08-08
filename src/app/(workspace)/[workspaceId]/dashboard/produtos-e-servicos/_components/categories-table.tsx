"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CategoryActions } from "./category-actions"

interface Category {
  id: number
  nome: string
  _count?: {
    produtosServicos?: number
  }
}

interface CategoriesTableProps {
  workspaceId: string
}

export function CategoriesTable({ workspaceId }: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/categorias`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [workspaceId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted animate-pulse rounded w-32" />
                <div className="h-6 bg-muted animate-pulse rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center justify-between">
          <span>Categorias ({categories.length})</span>
          <Badge variant="outline" className="ml-2">
            {categories.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma categoria cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira categoria para organizar seus produtos
            </p>
          </div>
        ) : (
          <div className="divide-y">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20 text-sm font-medium text-muted-foreground">
              <div>Nome</div>
              <div>Produtos</div>
              <div className="text-right">Ações</div>
            </div>
            {categories.map((category) => (
              <div key={category.id} className="grid grid-cols-3 gap-4 p-4 hover:bg-muted/30 transition-colors">
                <div className="font-medium">{category.nome}</div>
                <div>
                  <Badge 
                    variant={category._count?.produtosServicos ? "default" : "secondary"}
                    className={category._count?.produtosServicos ? "bg-green-100 text-green-800 border-green-200" : ""}
                  >
                    {category._count?.produtosServicos || 0} produto{(category._count?.produtosServicos || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <CategoryActions 
                    category={category}
                    workspaceId={workspaceId}
                    onUpdate={fetchCategories}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
