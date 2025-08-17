"use client"

import { CategoriesListClient } from "./categories-list-client"

interface CategoriesContentProps {
  workspaceId: string
  refreshTrigger: number
  search: string
}

export function CategoriesContent({ workspaceId, refreshTrigger, search }: CategoriesContentProps) {
  return (
    <CategoriesListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
      search={search}
    />
  )
}
