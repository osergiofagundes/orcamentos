'use client'

import { useEffect, useState } from 'react'
import { WorkspaceCard } from './workspace-card'
import { CreateWorkspaceModal } from './create-workspace-modal'
import { JoinWithCodeModal } from './join-with-code-modal'
import { Button } from '@/components/ui/button'
import { Frown, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { EmailVerificationModal } from '@/components/email-verification-modal'
import { useEmailVerification } from '@/hooks/use-email-verification'

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
  userEmail: string;
  isEmailVerified: boolean;
}

export function WorkspaceListClient({ initialWorkspaces, userId, userEmail, isEmailVerified }: WorkspaceListClientProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithPermission[]>(initialWorkspaces)
  
  // Hook para verificação de email
  const { isModalOpen, closeModal, checkEmailVerificationBeforeAction } = useEmailVerification({
    userEmail,
    isEmailVerified
  })

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
          <Button 
            variant="outline" 
            size="sm" 
            className="hover:text-red-600 hover:border-red-600 cursor-pointer w-full sm:w-auto"
            onClick={() => checkEmailVerificationBeforeAction(() => {
              window.location.href = "/workspace-management/lixeira"
            })}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Lixeira
          </Button>
          <JoinWithCodeModal 
            onWorkspaceJoined={refreshWorkspaces} 
            checkEmailVerification={checkEmailVerificationBeforeAction}
          />
          <CreateWorkspaceModal 
            onWorkspaceCreated={refreshWorkspaces}
            checkEmailVerification={checkEmailVerificationBeforeAction}
          />
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4 text-lg">Você ainda não tem nenhuma área de trabalho</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard 
              key={workspace.id}
              workspace={workspace}
              userPermissionLevel={workspace.usuariosAreas[0]?.nivel_permissao || 1}
              onWorkspaceUpdated={refreshWorkspaces}
              checkEmailVerification={checkEmailVerificationBeforeAction}
            />
          ))}
        </div>
      )}
      
      {/* Modal de verificação de email */}
      <EmailVerificationModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        userEmail={userEmail}
      />
    </div>
  )
}
