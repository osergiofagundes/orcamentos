"use client"

import { CategoriesListClient } from "./categories-list-client"

interface CategoriesContentProps {
  workspaceId: string
  refreshTrigger: number
}

export function CategoriesContent({ workspaceId, refreshTrigger }: CategoriesContentProps) {
  return (
    <CategoriesListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
    />
  )
}
