"use client"

import { OrcamentosList } from "./orcamentos-list"
import { DateRange } from "react-day-picker"

interface OrcamentosContentProps {
  workspaceId: string
  refreshTrigger: number
  search?: string
  statusFilter?: string
  responsavelFilter?: string
  dateRange?: DateRange
  onResponsaveisLoaded?: (responsaveis: string[]) => void
}

export function OrcamentosContent({ workspaceId, refreshTrigger, search, statusFilter, responsavelFilter, dateRange, onResponsaveisLoaded }: OrcamentosContentProps) {
  return (
    <OrcamentosList 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
      search={search}
      statusFilter={statusFilter}
      responsavelFilter={responsavelFilter}
      dateRange={dateRange}
      onResponsaveisLoaded={onResponsaveisLoaded}
    />
  )
}
