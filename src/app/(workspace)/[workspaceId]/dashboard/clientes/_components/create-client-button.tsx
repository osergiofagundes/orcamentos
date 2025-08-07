"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateClientModal } from "./create-client-modal"

interface CreateClientButtonProps {
  workspaceId: string
}

export function CreateClientButton({ workspaceId }: CreateClientButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Cliente
      </Button>
      <CreateClientModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        workspaceId={workspaceId}
      />
    </>
  )
}
