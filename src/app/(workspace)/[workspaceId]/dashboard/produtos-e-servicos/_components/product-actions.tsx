"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { EditProductModal } from "./edit-product-modal"
import { DeleteProductModal } from "./delete-product-modal"

interface Product {
  id: number
  nome: string
  descricao?: string | null
  valor?: number | null
  tipo_valor: "UNIDADE" | "METRO" | "PESO"
  categoria_id: number
  categoria: {
    id: number
    nome: string
  }
}

interface ProductActionsProps {
  product: Product
  workspaceId: string
  onProductDeleted?: () => void
}

export function ProductActions({ product, workspaceId, onProductDeleted }: ProductActionsProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProductModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        product={product}
        workspaceId={workspaceId}
      />

      <DeleteProductModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        product={product}
        workspaceId={workspaceId}
        onProductDeleted={onProductDeleted}
      />
    </>
  )
}
