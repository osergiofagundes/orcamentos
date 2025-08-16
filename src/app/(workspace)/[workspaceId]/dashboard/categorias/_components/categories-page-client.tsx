"use client"

import { useState } from "react"
import { CreateCategoryModal } from "./create-category-modal"
import { CategoriesContent } from "./categories-content"
import { CategoriesStats } from "./categories-stats"

interface CategoriesPageClientProps {
  workspaceId: string
}

export function CategoriesPageClient({ workspaceId }: CategoriesPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleCategoryCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias dos seus produtos e serviços
          </p>
        </div>
        <CreateCategoryModal 
          workspaceId={workspaceId}
          onCategoryCreated={handleCategoryCreated}
        />
      </div>
      <CategoriesStats workspaceId={workspaceId} />
      <CategoriesContent workspaceId={workspaceId} refreshTrigger={refreshTrigger} />
    </>
  )
}
