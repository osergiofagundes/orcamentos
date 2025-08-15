"use client"

import { useState } from "react"
import { CreateClientModal } from "./create-client-modal"
import { ClientsContent } from "./clients-content"
import { ClientsStats } from "./clients-stats"

interface ClientsPageClientProps {
  workspaceId: string
}

export function ClientsPageClient({ workspaceId }: ClientsPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleClientCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e acompanhe estatísticas importantes
          </p>
        </div>
        <CreateClientModal 
          workspaceId={workspaceId}
          onClientCreated={handleClientCreated}
        />
      </div>
      <ClientsStats workspaceId={workspaceId} />
      <ClientsContent workspaceId={workspaceId} refreshTrigger={refreshTrigger} />
    </>
  )
}
