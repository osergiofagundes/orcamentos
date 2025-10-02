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
  valor?: number | null
  tipo: "PRODUTO" | "SERVICO"
  tipo_valor: "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO"
  categoria_id: number | null
  categoria: {
    id: number
    nome: string
  } | null
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
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Enviar para lixeira
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
