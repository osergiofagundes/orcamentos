"use client"

import { useState } from "react"
import { CreateClientModal } from "./create-client-modal"
import { ClientsContent } from "./clients-content"
import { ClientsStats } from "./clients-stats"
import { SearchInput } from "@/components/search-input"

interface ClientsPageClientProps {
  workspaceId: string
}

export function ClientsPageClient({ workspaceId }: ClientsPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")

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

      <div className="mb-6">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          placeholder="Pesquisar clientes por ID, nome, CPF/CNPJ, telefone ou email" 
        />
      </div>

      <ClientsContent workspaceId={workspaceId} refreshTrigger={refreshTrigger} search={search} />
    </>
  )
}
