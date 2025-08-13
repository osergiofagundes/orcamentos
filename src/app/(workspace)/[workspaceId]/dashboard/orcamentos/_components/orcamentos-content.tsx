"use client"

import { useState } from "react"
import { CreateOrcamentoModal } from "./create-orcamento-modal"
import { OrcamentosList } from "./orcamentos-list"

interface OrcamentosContentProps {
  workspaceId: string
}

export function OrcamentosContent({ workspaceId }: OrcamentosContentProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleOrcamentoCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex justify-end">
        <CreateOrcamentoModal 
          workspaceId={workspaceId}
          onOrcamentoCreated={handleOrcamentoCreated}
        />
      </div>
      <OrcamentosList 
        workspaceId={workspaceId}
        refreshTrigger={refreshTrigger}
      />
    </>
  )
}
