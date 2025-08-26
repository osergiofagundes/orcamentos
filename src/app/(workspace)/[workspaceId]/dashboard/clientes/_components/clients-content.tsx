"use client"

import { ClientsListClient } from "./clients-list-client"
import { DateRange } from "react-day-picker"

interface ClientsContentProps {
  workspaceId: string
  refreshTrigger: number
  search: string
  dateRange?: DateRange
}

export function ClientsContent({ workspaceId, refreshTrigger, search, dateRange }: ClientsContentProps) {
  return (
    <ClientsListClient 
      workspaceId={workspaceId}
      refreshTrigger={refreshTrigger}
      search={search}
      dateRange={dateRange}
    />
  )
}
