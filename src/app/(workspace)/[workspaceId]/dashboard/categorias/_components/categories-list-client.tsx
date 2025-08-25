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
import { Button } from "@/components/ui/button"
import { Plus, Tag } from "lucide-react"
import { CategoryActions } from "./category-actions"
import { DateRange } from "react-day-picker"

interface Category {
  id: number
  nome: string
  createdAt: string
  _count?: {
    produtosServicos?: number
  }
}

interface CategoriesListClientProps {
  workspaceId: string
  refreshTrigger?: number
  search: string
  canManageCategories: boolean
  dateRange?: DateRange
}

export function CategoriesListClient({ workspaceId, refreshTrigger, search, canManageCategories, dateRange }: CategoriesListClientProps) {
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
  }, [workspaceId, refreshTrigger])

  const handleCategoryUpdate = () => {
    fetchCategories()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Função para filtrar categorias baseado na busca e data
  const filteredCategories = categories.filter(category => {
    // Filtro de pesquisa
    if (search && search.trim() !== '') {
      const searchTerm = search.toLowerCase().trim()
      
      // Função auxiliar para busca em texto
      const matchesText = (text: string | number | null | undefined): boolean => {
        if (text === null || text === undefined) return false
        return text.toString().toLowerCase().includes(searchTerm)
      }
      
      // Verifica se o termo de busca está presente em qualquer campo
      const matchesSearch = (
        matchesText(category.id) ||
        matchesText(category.nome)
      )
      if (!matchesSearch) return false
    }

    // Filtro de data
    if (dateRange?.from || dateRange?.to) {
      const categoryDate = new Date(category.createdAt)
      
      // Se só tem data inicial, filtra a partir dela
      if (dateRange.from && !dateRange.to) {
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        if (categoryDate < fromDate) return false
      }
      
      // Se tem ambas as datas, filtra pelo intervalo
      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from)
        const toDate = new Date(dateRange.to)
        fromDate.setHours(0, 0, 0, 0)
        toDate.setHours(23, 59, 59, 999)
        
        if (categoryDate < fromDate || categoryDate > toDate) return false
      }
    }

    return true
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-32" />
                  <div className="h-3 bg-muted animate-pulse rounded w-48" />
                </div>
                <div className="h-6 bg-muted animate-pulse rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
          <p className="text-muted-foreground">
            Comece criando sua primeira categoria clicando no botão "Nova Categoria".
          </p>
        </CardContent>
      </Card>
    )
  }

  if (filteredCategories.length === 0 && (search || dateRange?.from || dateRange?.to)) {
    const hasFilters = (search && search.trim() !== "") || (dateRange?.from || dateRange?.to)
    
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {hasFilters
              ? "Nenhuma categoria encontrada com os filtros aplicados"
              : "Nenhuma categoria encontrada"
            }
          </h3>
          <p className="text-muted-foreground">
            {hasFilters
              ? "Tente ajustar os filtros ou termos da sua pesquisa."
              : "Comece criando sua primeira categoria clicando no botão \"Nova Categoria\"."
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Categorias</CardTitle>
      </CardHeader>
      <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Criado em</TableHead>
                {canManageCategories && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">#{category.id}</TableCell>
                  <TableCell className="font-medium">{category.nome}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {category._count?.produtosServicos || 0} produto(s)
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(category.createdAt)}
                  </TableCell>
                  {canManageCategories && (
                    <TableCell className="text-right">
                      <CategoryActions
                        category={category}
                        workspaceId={workspaceId}
                        onUpdate={handleCategoryUpdate}
                      />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  )
}
