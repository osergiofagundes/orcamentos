"use client"

import React, { useState } from "react"
import { LixeiraContent } from "./lixeira-content"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"
import { EmptyTrashModal } from "./empty-trash-modal"
import { Trash2 } from "lucide-react"

interface LixeiraPageClientProps {
  workspaceId: string
}

type FilterType = "all" | "clientes" | "orcamentos" | "produtos" | "categorias"

export function LixeiraPageClient({ workspaceId }: LixeiraPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")

  const handleItemRestored = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEmptyTrash = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Lixeira</h1>
          <p className="hidden text-muted-foreground sm:block">
            Gerencie itens excluídos e restaure quando necessário
          </p>
        </div>
        <EmptyTrashModal
          workspaceId={workspaceId}
          onEmptyTrash={handleEmptyTrash}
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-1/2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar itens na lixeira..."
          />
        </div>
        <div className="w-full md:w-auto">
          <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os itens</SelectItem>
              <SelectItem value="clientes">Clientes</SelectItem>
              <SelectItem value="orcamentos">Orçamentos</SelectItem>
              <SelectItem value="produtos">Produtos/Serviços</SelectItem>
              <SelectItem value="categorias">Categorias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <LixeiraContent 
        workspaceId={workspaceId} 
        refreshTrigger={refreshTrigger} 
        search={search} 
        filterType={filterType}
        onItemRestored={handleItemRestored}
      />
    </>
  )
}