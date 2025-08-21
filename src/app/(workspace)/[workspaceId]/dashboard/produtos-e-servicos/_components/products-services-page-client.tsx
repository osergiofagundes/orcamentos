"use client"

import { useState } from "react"
import { ProductsServicesStats } from "./products-services-stats"
import { ProductsTable } from "./products-table"
import { CreateProductButton } from "./create-product-button"
import { SearchInput } from "@/components/search-input"
import { useUserPermissions } from "@/hooks/use-user-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock } from "lucide-react"

interface ProductsServicesPageClientProps {
  workspaceId: string
}

export function ProductsServicesPageClient({ workspaceId }: ProductsServicesPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const { canManageProducts, userLevel, isLoading } = useUserPermissions(workspaceId)

  const handleDataChanged = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Produtos & Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie seu catálogo completo de produtos e serviços
          </p>
        </div>
        {canManageProducts ? (
          <CreateProductButton
            workspaceId={workspaceId}
            onProductCreated={handleDataChanged}
          />
        ) : null}
      </div>

      {!canManageProducts && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você possui acesso somente para visualização.
          </AlertDescription>
        </Alert>
      )}

      <ProductsServicesStats workspaceId={workspaceId} />

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar por ID, nome, descrição ou categoria"
        />
      </div>

      <div className="space-y-6">
        <div>
          <ProductsTable
            workspaceId={workspaceId}
            refreshTrigger={refreshTrigger}
            onDataChanged={handleDataChanged}
            search={search}
            canManageProducts={canManageProducts}
          />
        </div>
      </div>
    </>
  )
}
