"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Users, 
  ShoppingCart, 
  Package, 
  Tag, 
  Building, 
  MoreVertical,
  Undo2,
  Trash2,
  User,
  HandCoins
} from "lucide-react"
import { RestoreItemModal } from "./restore-item-modal"
import { DeletePermanentlyModal } from "./delete-permanently-modal"
import { useState } from "react"

interface TrashItemProps {
  item: {
    id: string
    type: "cliente" | "orcamento" | "produto" | "categoria"
    name: string
    deletedAt: string
    deletedBy: string
    deletedByName: string
    originalData: any
  }
  workspaceId: string
  onRestored?: () => void
  onDeleted?: () => void
}

const typeConfig = {
  cliente: {
    icon: User,
    label: "Cliente",
    color: "bg-blue-100 text-blue-800"
  },
  orcamento: {
    icon: HandCoins,
    label: "Orçamento",
    color: "bg-green-100 text-green-800"
  },
  produto: {
    icon: Package,
    label: "Produto/Serviço",
    color: "bg-purple-100 text-purple-800"
  },
  categoria: {
    icon: Tag,
    label: "Categoria",
    color: "bg-orange-100 text-orange-800"
  }
}

export function TrashItem({ item, workspaceId, onRestored, onDeleted }: TrashItemProps) {
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const config = typeConfig[item.type]
  const Icon = config.icon

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{item.name}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
                {config.label}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Excluído em {format(new Date(item.deletedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              {item.deletedByName && ` por ${item.deletedByName}`}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowRestoreModal(true)}>
              <Undo2 className="h-4 w-4 mr-2" />
              Restaurar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Permanentemente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RestoreItemModal
        open={showRestoreModal}
        onOpenChange={setShowRestoreModal}
        item={item}
        workspaceId={workspaceId}
        onRestored={onRestored}
      />

      <DeletePermanentlyModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        item={item}
        workspaceId={workspaceId}
        onDeleted={onDeleted}
      />
    </>
  )
}