"use client"

import { ClientsListClient } from "./clients-list-client"

interface ClientsContentProps {
  workspaceId: string
  refreshTrigger: number
}

export function ClientsContent({ workspaceId, refreshTrigger }: ClientsContentProps) {
  return (
    <ClientsListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
    />
  )
}
