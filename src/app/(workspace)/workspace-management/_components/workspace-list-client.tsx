'use client'

import { useEffect, useState } from 'react'
import { WorkspaceCard } from './workspace-card'
import { CreateWorkspaceModal } from './create-workspace-modal'
import { JoinWithCodeModal } from './join-with-code-modal'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

interface WorkspaceWithPermission {
  id: number;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  logo_url: string | null;
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
    <div className="container mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Minhas Áreas de Trabalho</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link href="/workspace-management/trash">
            <Button variant="outline" size="sm" className="hover:text-red-600 hover:border-red-600 cursor-pointer">
              <Trash2 className="h-4 w-4 mr-1" />
              Lixeira
            </Button>
          </Link>
          <JoinWithCodeModal onWorkspaceJoined={refreshWorkspaces} />
          <CreateWorkspaceModal onWorkspaceCreated={refreshWorkspaces} />
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não tem nenhuma área de trabalho</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            <Link href="/workspace-management/trash">
              <Button variant="outline" size="sm" className="hover:text-red-600 hover:border-red-600 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-1" />
                Lixeira
              </Button>
            </Link>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
