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
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Produto/Serviço
      </Button>
      <CreateProductModal 
        isOpen={isOpen} 
        onClose={handleClose}
        workspaceId={workspaceId}
      />
    </>
  )
}
