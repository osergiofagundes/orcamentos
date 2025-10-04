'use client'

import { useEffect, useState } from 'react'
import { TrashWorkspaceCard } from './trash-workspace-card'
import { EmailVerificationModal } from '@/components/email-verification-modal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface TrashedWorkspaceWithPermission {
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
  inTrash: boolean;
  trashedAt: Date | null;
  trashedBy: string | null;
  usuariosAreas: {
    nivel_permissao: number;
  }[];
  usuarioQueMoveuParaLixeira: {
    name: string;
    email: string;
  } | null;
}

interface TrashListClientProps {
  initialTrashedWorkspaces: TrashedWorkspaceWithPermission[];
  userId: string;
  needsEmailVerification?: boolean;
  userEmail?: string;
}

export function TrashListClient({ 
  initialTrashedWorkspaces, 
  userId,
  needsEmailVerification = false,
  userEmail = ''
}: TrashListClientProps) {
  const [trashedWorkspaces, setTrashedWorkspaces] = useState<TrashedWorkspaceWithPermission[]>(initialTrashedWorkspaces)
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(needsEmailVerification)

  const refreshTrashedWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspace/trash')
      if (response.ok) {
        const data = await response.json()
        setTrashedWorkspaces(data)
      }
    } catch (error) {
      console.error('Erro ao atualizar lista de workspaces na lixeira:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6">
    <div className="mb-6">
      <div className="mb-4">
        <Link href="/workspace-management">
        <Button variant="outline" size="sm" className='cursor-pointer hover:bg-sky-50 hover:border-gray-400'>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">Lixeira</h1>
      </div>
    </div>
      {trashedWorkspaces.length === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">A lixeira está vazia</h3>
            <p className="text-muted-foreground">Áreas de trabalho excluídas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trashedWorkspaces.map((workspace) => (
                <TrashWorkspaceCard 
                key={workspace.id}
                workspace={workspace}
                userPermissionLevel={workspace.usuariosAreas[0]?.nivel_permissao || 1}
                onWorkspaceAction={refreshTrashedWorkspaces}
                disabled={needsEmailVerification}
                onDisabledClick={() => setShowEmailVerificationModal(true)}
                />
            ))}
        </div>
      )}
      
      {/* Modal de verificação de email */}
      <EmailVerificationModal 
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        userEmail={userEmail}
      />
    </div>
  )
}