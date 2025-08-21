'use client'

import { useEffect, useState } from 'react'
import { WorkspaceCard } from './workspace-card'
import { CreateWorkspaceModal } from './create-workspace-modal'
import { JoinWithCodeModal } from './join-with-code-modal'

interface WorkspaceWithPermission {
  id: number;
  nome: string;
  descricao: string | null;
  cpf_cnpj: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  usuariosAreas: {
    nivel_permissao: number;
  }[];
}

interface WorkspaceListClientProps {
  initialWorkspaces: WorkspaceWithPermission[];
  userId: string;
}

export function WorkspaceListClient({ initialWorkspaces, userId }: WorkspaceListClientProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithPermission[]>(initialWorkspaces)

  const refreshWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspace')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data)
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de workspaces:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Áreas de Trabalho</h1>
        <div className="flex gap-3">
          <JoinWithCodeModal onWorkspaceJoined={refreshWorkspaces} />
          <CreateWorkspaceModal onWorkspaceCreated={refreshWorkspaces} />
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não tem nenhuma área de trabalho</p>
          <div className="flex justify-center gap-3">
            <JoinWithCodeModal 
              onWorkspaceJoined={refreshWorkspaces}
              buttonText="Entrar com código"
            />
            <CreateWorkspaceModal 
              onWorkspaceCreated={refreshWorkspaces}
              buttonText="Criar primeira área"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard 
              key={workspace.id}
              workspace={workspace}
              userPermissionLevel={workspace.usuariosAreas[0]?.nivel_permissao || 1}
              onWorkspaceUpdated={refreshWorkspaces}
            />
          ))}
        </div>
      )}
    </div>
  )
}
