"use client"

import { OrcamentosList } from "./orcamentos-list"

interface OrcamentosContentProps {
  workspaceId: string
  refreshTrigger: number
}

export function OrcamentosContent({ workspaceId, refreshTrigger }: OrcamentosContentProps) {
  return (
    <OrcamentosList 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
    />
  )
}
