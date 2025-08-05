import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AreaTrabalho } from '@/generated/prisma'

interface WorkspaceCardProps {
  workspace: AreaTrabalho & {
    usuariosAreas: {
      nivel_permissao: number
    }[]
  }
  userPermissionLevel: number
}

export function WorkspaceCard({ workspace, userPermissionLevel }: WorkspaceCardProps) {
  const getPermissionLabel = (level: number) => {
    switch(level) {
      case 3: return 'Dono'
      case 2: return 'Admin'
      default: return 'Membro'
    }
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{workspace.nome}</h3>
          {workspace.descricao && (
            <p className="text-sm text-muted-foreground mt-1">
              {workspace.descricao}
            </p>
          )}
        </div>
        <Badge variant="outline">
          {getPermissionLabel(userPermissionLevel)}
        </Badge>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Criado em: {new Date(workspace.createdAt).toLocaleDateString()}
        </span>
        <Link href={`/${workspace.id}/dashboard`}>
          <Button variant="outline" size="sm">
            Acessar
          </Button>
        </Link>
      </div>
    </div>
  )
}