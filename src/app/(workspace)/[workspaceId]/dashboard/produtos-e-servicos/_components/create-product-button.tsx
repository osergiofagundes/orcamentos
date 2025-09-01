"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProductModal } from "./create-product-modal"

interface CreateProductButtonProps {
  workspaceId: string
  onProductCreated?: () => void
}

export function CreateProductButton({ workspaceId, onProductCreated }: CreateProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => {
    setIsOpen(false)
    onProductCreated?.()
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer">
        Novo Produto/Serviço
        <Plus className="h-4 w-4" />
      </Button>
      <CreateProductModal 
        isOpen={isOpen} 
        onClose={handleClose}
        workspaceId={workspaceId}
      />
    </>
  )
}
