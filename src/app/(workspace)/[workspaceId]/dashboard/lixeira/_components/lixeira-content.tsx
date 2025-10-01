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
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <Trash2 className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <p className="text-gray-500 mb-2 text-lg">
        {search || filterType !== "all" 
          ? "Nenhum item encontrado" 
          : "A lixeira está vazia"
        }
          </p>
          <p className="text-sm text-muted-foreground">
        {search || filterType !== "all"
          ? "Tente ajustar os filtros ou termos de pesquisa"
          : "Itens excluídos aparecerão aqui"
        }
          </p>
        </div>
      </Card>
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