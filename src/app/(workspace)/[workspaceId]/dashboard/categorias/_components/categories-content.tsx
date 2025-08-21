"use client"

import { CategoriesListClient } from "./categories-list-client"

interface CategoriesContentProps {
  workspaceId: string
  refreshTrigger: number
  search: string
  canManageCategories: boolean
}

export function CategoriesContent({ workspaceId, refreshTrigger, search, canManageCategories }: CategoriesContentProps) {
  return (
    <CategoriesListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
      search={search}
      canManageCategories={canManageCategories}
    />
  )
}
