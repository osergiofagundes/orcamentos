"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "@phosphor-icons/react"
import { ProductsStats } from "./products-stats-client"
import { ProductsGrid } from "./products-grid-client"
import { CreateProductButton } from "./create-product-button"

interface ProductsTabProps {
  workspaceId: string
}

export function ProductsTab({ workspaceId }: ProductsTabProps) {
  return (
    <div className="space-y-6">
      {/* Cabeçalho da aba */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Produtos & Serviços</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seu catálogo de produtos e serviços, acompanhe estatísticas e organize por categorias
          </p>
        </div>
        <CreateProductButton workspaceId={workspaceId} />
      </div>

      {/* Estatísticas */}
      <div>
        <h3 className="text-lg font-medium mb-3">Visão Geral</h3>
        <ProductsStats workspaceId={workspaceId} />
      </div>

      {/* Grid de produtos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Catálogo</h3>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie todos os seus produtos e serviços
          </p>
        </div>
        <ProductsGrid workspaceId={workspaceId} />
      </div>
    </div>
  )
}
