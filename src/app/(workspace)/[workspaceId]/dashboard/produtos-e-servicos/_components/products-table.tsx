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
import { Plus, Package, Mail } from "lucide-react"
import { CreateProductButton } from "./create-product-button"
import { ProductActions } from "./product-actions"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Product {
  id: number
  nome: string
  valor?: number | null
  tipo: "PRODUTO" | "SERVICO"
  tipo_valor: "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO"
  categoria_id: number | null
  createdAt: string
  categoria: {
    id: number
    nome: string
  } | null
}

interface ProductsTableProps {
  workspaceId: string
  refreshTrigger?: number
  onDataChanged?: () => void
  search?: string
  canManageProducts: boolean
  dateRange?: DateRange | undefined
  categoryFilter?: string
  tipoFilter?: string
  tipoValorFilter?: string
  onCategoriesLoaded?: (categories: string[]) => void
  onTiposValorLoaded?: (tiposValor: string[]) => void
}

export function ProductsTable({ workspaceId, refreshTrigger, onDataChanged, search, canManageProducts, dateRange, categoryFilter, tipoFilter, tipoValorFilter, onCategoriesLoaded, onTiposValorLoaded }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const formatTipoValor = (tipo: "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO") => {
    const tipoLabels = {
      UNIDADE: "Unidades",
      METRO: "Metros",
      METRO_QUADRADO: "Metros Quadrados",
      METRO_CUBICO: "Metro Cúbico",
      CENTIMETRO: "Centímetros",
      DUZIA: "Dúzias",
      QUILO: "Quilo",
      GRAMA: "Grama",
      QUILOMETRO: "Quilômetro",
      LITRO: "Litros",
      MINUTO: "Minutos",
      HORA: "Horas",
      DIA: "Dias",
      MES: "Meses",
      ANO: "Anos"
    }
    return tipoLabels[tipo]
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/produtos`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)

        // Extrair categorias únicas para o filtro
        const uniqueCategories = [...new Set(data.map((product: Product) => product.categoria?.nome || "Sem categoria").filter(Boolean))] as string[]
        onCategoriesLoaded?.(uniqueCategories)

        // Extrair tipos de valor únicos para o filtro
        const uniqueTiposValor = [...new Set(data.map((product: Product) => formatTipoValor(product.tipo_valor)))] as string[]
        onTiposValorLoaded?.(uniqueTiposValor)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [workspaceId, refreshTrigger])

  const handleProductDeleted = () => {
    fetchProducts()
    onDataChanged?.()
  }

  // Filtrar produtos baseado na pesquisa, data e categoria
  const filteredProducts = products.filter(product => {
    // Filtro de pesquisa
    if (search && search.trim() !== "") {
      const searchTerm = search.toLowerCase().trim()
      const matchesSearch = (
        product.id.toString().includes(searchTerm) ||
        product.nome.toLowerCase().includes(searchTerm) ||
        (product.categoria?.nome || "Sem categoria").toLowerCase().includes(searchTerm)
      )
      if (!matchesSearch) return false
    }

    // Filtro de categoria
    if (categoryFilter && categoryFilter !== "all") {
      const productCategoryName = product.categoria?.nome || "Sem categoria"
      if (productCategoryName !== categoryFilter) return false
    }

    // Filtro de tipo (produto/serviço)
    if (tipoFilter && tipoFilter !== "all") {
      if (product.tipo !== tipoFilter) return false
    }

    // Filtro de tipo de valor
    if (tipoValorFilter && tipoValorFilter !== "all") {
      if (formatTipoValor(product.tipo_valor) !== tipoValorFilter) return false
    }

    // Filtro de data
    if (dateRange?.from || dateRange?.to) {
      const productDate = new Date(product.createdAt)

      // Se só tem data inicial, filtra a partir dela
      if (dateRange.from && !dateRange.to) {
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        if (productDate < fromDate) return false
      }

      // Se tem ambas as datas, filtra pelo intervalo
      if (dateRange.from && dateRange.to) {
        const fromDate = new Date(dateRange.from)
        const toDate = new Date(dateRange.to)
        fromDate.setHours(0, 0, 0, 0)
        toDate.setHours(23, 59, 59, 999)

        if (productDate < fromDate || productDate > toDate) return false
      }
    }

    return true
  })

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos & Serviços</CardTitle>
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-48" />
                  <div className="h-3 bg-muted animate-pulse rounded w-32" />
                </div>
                <div className="h-8 bg-muted animate-pulse rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            Comece criando seu primeiro produto ou serviço.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (filteredProducts.length === 0 && (search || dateRange?.from || dateRange?.to || (categoryFilter && categoryFilter !== "all") || (tipoFilter && tipoFilter !== "all") || (tipoValorFilter && tipoValorFilter !== "all"))) {
    const hasFilters = (search && search.trim() !== "") || (dateRange?.from || dateRange?.to) || (categoryFilter && categoryFilter !== "all") || (tipoFilter && tipoFilter !== "all") || (tipoValorFilter && tipoValorFilter !== "all")

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {hasFilters
              ? "Nenhum produto encontrado com os filtros aplicados"
              : "Nenhum produto encontrado"
            }
          </h3>
          <p className="text-muted-foreground">
            {hasFilters
              ? "Tente ajustar os filtros ou termos da sua pesquisa."
              : "Comece criando seu primeiro produto ou serviço."
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Tabela de produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos & Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tipo Medida</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Criado em</TableHead>
                {canManageProducts && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageProducts ? 8 : 7} className="text-center text-muted-foreground py-8">
                    {(search && search.trim() !== "") || dateRange?.from || dateRange?.to || (categoryFilter && categoryFilter !== "all") || (tipoFilter && tipoFilter !== "all") || (tipoValorFilter && tipoValorFilter !== "all")
                      ? "Nenhum produto encontrado com os filtros aplicados"
                      : "Nenhum produto cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">#{product.id}</TableCell>
                    <TableCell>{product.nome}</TableCell>
                    <TableCell>{formatCurrency(product.valor)}</TableCell>
                    <TableCell>
                      <Badge className={product.tipo === "PRODUTO" ? "bg-sky-600" : "outline outline-gray-300 bg-transparent text-black"}>
                        {product.tipo === "PRODUTO" ? "Produto" : "Serviço"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="outline outline-gray-300 bg-transparent text-black">{formatTipoValor(product.tipo_valor)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="outline outline-gray-300 bg-transparent text-black">{product.categoria?.nome || "Sem categoria"}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(product.createdAt)}
                    </TableCell>
                    {canManageProducts && (
                      <TableCell className="text-right">
                        <ProductActions
                          product={product}
                          workspaceId={workspaceId}
                          onProductDeleted={handleProductDeleted}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
