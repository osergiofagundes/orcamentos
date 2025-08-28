import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditWorkspaceModal } from './edit-workspace-modal'
import { DeleteWorkspaceModal } from './delete-workspace-modal'

// Função para formatar data de forma consistente entre servidor e cliente
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

interface WorkspaceData {
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
}

interface WorkspaceCardProps {
  workspace: WorkspaceData & {
    usuariosAreas: {
      nivel_permissao: number
    }[]
  }
  userPermissionLevel: number
  onWorkspaceUpdated?: () => void
}

export function WorkspaceCard({ workspace, userPermissionLevel, onWorkspaceUpdated }: WorkspaceCardProps) {
  const getPermissionLabel = (level: number) => {
    switch(level) {
      case 3: return 'Dono'
      case 2: return 'Admin'
      default: return 'Membro'
    }
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-1">
          {workspace.logo_url && (
            <div className="flex-shrink-0">
              <Image
                src={workspace.logo_url}
                alt={`Logo ${workspace.nome}`}
                width={48}
                height={48}
                className="rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{workspace.nome}</h3>
          </div>
        </div>
        <Badge variant="outline">
          {getPermissionLabel(userPermissionLevel)}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Criado em: {formatDate(workspace.createdAt)}
        </span>
        <div className="flex gap-1">
          {/* Apenas donos podem editar e excluir */}
          {userPermissionLevel === 3 && (
            <>
              <EditWorkspaceModal 
                workspace={workspace} 
                onWorkspaceUpdated={onWorkspaceUpdated}
              />
              <DeleteWorkspaceModal 
                workspace={workspace} 
                onWorkspaceDeleted={onWorkspaceUpdated}
              />
            </>
          )}
          <Link href={`/${workspace.id}/dashboard`}>
            <Button variant="outline" size="sm">
              Acessar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}