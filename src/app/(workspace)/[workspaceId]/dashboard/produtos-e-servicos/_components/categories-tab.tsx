"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "@phosphor-icons/react"
import { CategoriesStats } from "./categories-stats"
import { CategoriesTable } from "./categories-table"
import { CreateCategoryModal } from "./create-category-modal"

interface CategoriesTabProps {
  workspaceId: string
}

export function CategoriesTab({ workspaceId }: CategoriesTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Cabeçalho da aba */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Organize seus produtos e serviços em categorias para melhor gestão e controle
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      {/* Estatísticas */}
      <div>
        <h3 className="text-lg font-medium mb-3">Estatísticas</h3>
        <CategoriesStats workspaceId={workspaceId} />
      </div>

      {/* Tabela de categorias */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Gerenciar Categorias</h3>
          <p className="text-sm text-muted-foreground">
            Visualize, edite ou exclua suas categorias existentes
          </p>
        </div>
        <CategoriesTable workspaceId={workspaceId} />
      </div>

      <CreateCategoryModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  )
}
