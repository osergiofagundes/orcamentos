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

interface Product {
  id: number
  nome: string
  descricao?: string | null
  valor?: number | null
  tipo_valor: "UNIDADE" | "METRO" | "PESO"
  categoria_id: number
  createdAt: string
  categoria: {
    id: number
    nome: string
  }
}

interface ProductsTableProps {
  workspaceId: string
  refreshTrigger?: number
  onDataChanged?: () => void
  search?: string
}

export function ProductsTable({ workspaceId, refreshTrigger, onDataChanged, search }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/produtos`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
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

  // Filtrar produtos baseado na pesquisa
  const filteredProducts = products.filter(product => {
    if (!search || search.trim() === "") return true
    
    const searchTerm = search.toLowerCase().trim()
    return (
      product.id.toString().includes(searchTerm) ||
      product.nome.toLowerCase().includes(searchTerm) ||
      (product.descricao && product.descricao.toLowerCase().includes(searchTerm)) ||
      product.categoria.nome.toLowerCase().includes(searchTerm)
    )
  })

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  const formatTipoValor = (tipo: "UNIDADE" | "METRO" | "PESO") => {
    const tipoLabels = {
      UNIDADE: "Unidade",
      METRO: "Metro", 
      PESO: "Peso"
    }
    return tipoLabels[tipo]
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo Valor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    {search && search.trim() !== "" 
                      ? `Nenhum produto encontrado para "${search}"` 
                      : "Nenhum produto cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">#{product.id}</TableCell>
                  <TableCell>{product.nome}</TableCell>
                  <TableCell>{product.descricao}</TableCell>
                  <TableCell>{formatCurrency(product.valor)}</TableCell>
                  <TableCell>{formatTipoValor(product.tipo_valor)}</TableCell>
                  <TableCell>{product.categoria.nome}</TableCell>
                                      <TableCell className="text-muted-foreground">
                      {formatDateTime(product.createdAt)}
                    </TableCell>
                  <TableCell className="text-right">
                    <ProductActions
                      product={product}
                      workspaceId={workspaceId}
                      onProductDeleted={handleProductDeleted}
                    />
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
