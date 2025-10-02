"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrashItem } from "./trash-item"
import { Loader2, Trash2 } from "lucide-react"

interface LixeiraContentProps {
  workspaceId: string
  refreshTrigger?: number
  search?: string
  filterType?: "all" | "clientes" | "orcamentos" | "produtos" | "categorias"
  onItemRestored?: () => void
}

interface TrashItemData {
  id: string
  type: "cliente" | "orcamento" | "produto" | "categoria"
  name: string
  deletedAt: string
  deletedBy: string
  deletedByName: string
  originalData: any
}

export function LixeiraContent({ 
  workspaceId, 
  refreshTrigger = 0, 
  search = "", 
  filterType = "all",
  onItemRestored 
}: LixeiraContentProps) {
  const [items, setItems] = useState<TrashItemData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrashItems() {
      try {
        setLoading(true)
        setError(null)
        
        const searchParams = new URLSearchParams()
        if (search) searchParams.append('search', search)
        if (filterType && filterType !== 'all') searchParams.append('type', filterType)
        
        const url = `/api/workspace/${workspaceId}/lixeira${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar itens da lixeira')
        }
        
        const data = await response.json()
        setItems(data.items || [])
      } catch (error) {
        console.error("Erro ao carregar itens da lixeira:", error)
        setError("Erro ao carregar itens da lixeira")
      } finally {
        setLoading(false)
      }
    }

    fetchTrashItems()
  }, [workspaceId, refreshTrigger, search, filterType])

  const handleItemRestored = () => {
    onItemRestored?.()
  }

  const handleItemDeleted = () => {
    onItemRestored?.()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <span className="text-red-600">{error}</span>
        </div>
      </Card>
    )
  }

  if (items.length === 0) {
    const hasFiltersApplied = search || (filterType && filterType !== 'all')
    
    return (
      <>
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasFiltersApplied ? 'Nenhum item encontrado' : 'A lixeira está vazia'}
            </h3>
            <p className="text-muted-foreground">
              {hasFiltersApplied 
                ? 'Nenhum item corresponde aos filtros aplicados.'
                : 'Itens excluídos aparecerão aqui.'
              }
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Itens na Lixeira ({items.length})
          </h3>
        </div>
        
        <div className="space-y-3">
          {items.map((item) => (
            <TrashItem
              key={`${item.type}-${item.id}`}
              item={item}
              workspaceId={workspaceId}
              onRestored={handleItemRestored}
              onDeleted={handleItemDeleted}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}