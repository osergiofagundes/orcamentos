"use client"

import { useState } from "react"
import { CreateCategoryModal } from "./create-category-modal"
import { CategoriesContent } from "./categories-content"
import { CategoriesStats } from "./categories-stats"
import { SearchInput } from "@/components/search-input"
import { useUserPermissions } from "@/hooks/use-user-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

interface CategoriesPageClientProps {
  workspaceId: string
}

export function CategoriesPageClient({ workspaceId }: CategoriesPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const { canManageCategories, userLevel, isLoading } = useUserPermissions(workspaceId)

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
        {canManageCategories ? (
          <CreateCategoryModal
            workspaceId={workspaceId}
            onCategoryCreated={handleCategoryCreated}
          />
        ) : null}
      </div>
      
      {!canManageCategories && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você possui acesso somente para visualização.
          </AlertDescription>
        </Alert>
      )}

      <CategoriesStats workspaceId={workspaceId} />

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar categorias por ID, nome ou descrição"
        />
      </div>

      <CategoriesContent 
        workspaceId={workspaceId} 
        refreshTrigger={refreshTrigger} 
        search={search}
        canManageCategories={canManageCategories}
      />
    </>
  )
}
