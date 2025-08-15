"use client"

import { CreateClientModal } from "./create-client-modal"

interface CreateClientButtonProps {
  workspaceId: string
  onClientCreated?: () => void
}

export function CreateClientButton({ workspaceId, onClientCreated }: CreateClientButtonProps) {
  return (
    <CreateClientModal 
      workspaceId={workspaceId}
      onClientCreated={onClientCreated}
    />
  )
}
