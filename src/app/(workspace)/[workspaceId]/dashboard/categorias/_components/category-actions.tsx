"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { EditCategoryModal } from "./edit-category-modal"
import { DeleteCategoryModal } from "./delete-category-modal"

interface Category {
  id: number
  nome: string
  _count?: {
    produtosServicos?: number
  }
}

interface CategoryActionsProps {
  category: Category
  workspaceId: string
  onUpdate: () => void
}

export function CategoryActions({ category, workspaceId, onUpdate }: CategoryActionsProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

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
          <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setDeleteModalOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCategoryModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          onUpdate()
        }}
        category={category}
        workspaceId={workspaceId}
      />

      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          onUpdate()
        }}
        category={category}
        workspaceId={workspaceId}
      />
    </>
  )
}
