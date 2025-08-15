"use client"

import { useState } from "react"
import { CreateOrcamentoModal } from "./create-orcamento-modal"
import { OrcamentosContent } from "./orcamentos-content"
import { OrcamentosStats } from "./orcamentos-stats"

interface OrcamentosPageClientProps {
  workspaceId: string
}

export function OrcamentosPageClient({ workspaceId }: OrcamentosPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleOrcamentoCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus orçamentos e acompanhe estatísticas importantes
          </p>
        </div>
        <CreateOrcamentoModal 
          workspaceId={workspaceId}
          onOrcamentoCreated={handleOrcamentoCreated}
        />
      </div>
      <OrcamentosStats workspaceId={workspaceId} />
      <OrcamentosContent workspaceId={workspaceId} refreshTrigger={refreshTrigger} />
    </>
  )
}
