"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductActions } from "./product-actions"

interface Product {
  id: number
  nome: string
  descricao?: string | null
  valor?: number | null
  tipo: "PRODUTO" | "SERVICO"
  tipo_valor: "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO"
  categoria_id: number
  createdAt: string
  categoria: {
    id: number
    nome: string
  }
}

interface ProductsGridProps {
  workspaceId: string
}

export function ProductsGrid({ workspaceId }: ProductsGridProps) {
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
  }, [workspaceId])

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "R$ 0,00"
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
                <div className="border-t pt-4">
                  <div className="h-8 bg-muted animate-pulse rounded w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      {products.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-muted-foreground/20 rounded-full" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum produto cadastrado</h3>
              <p className="text-muted-foreground">
                Adicione seu primeiro produto ou serviço para começar
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="relative group hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {product.nome}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    >
                      {product.categoria.nome}
                    </Badge>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ProductActions 
                      product={product} 
                      workspaceId={workspaceId} 
                      onProductDeleted={fetchProducts}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {product.descricao}
                    </p>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(product.valor || null)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Criado em {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
