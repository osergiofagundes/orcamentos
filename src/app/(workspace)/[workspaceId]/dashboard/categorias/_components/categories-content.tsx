"use client"

import { CategoriesListClient } from "./categories-list-client"
import { DateRange } from "react-day-picker"

interface CategoriesContentProps {
  workspaceId: string
  refreshTrigger: number
  search: string
  canManageCategories: boolean
  dateRange?: DateRange
}

export function CategoriesContent({ workspaceId, refreshTrigger, search, canManageCategories, dateRange }: CategoriesContentProps) {
  return (
    <CategoriesListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
      search={search}
      canManageCategories={canManageCategories}
      dateRange={dateRange}
    />
  )
}
