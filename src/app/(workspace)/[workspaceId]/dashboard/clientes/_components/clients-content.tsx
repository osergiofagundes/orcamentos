"use client"

import { ClientsListClient } from "./clients-list-client"

interface ClientsContentProps {
  workspaceId: string
  refreshTrigger: number
  search: string
}

export function ClientsContent({ workspaceId, refreshTrigger, search }: ClientsContentProps) {
  return (
    <ClientsListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
      search={search}
    />
  )
}
