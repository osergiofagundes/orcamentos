import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { WorkspaceCard } from './_components/workspace-card'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

export default async function WorkspaceManagementPage() {
  const session = await auth.api.getSession({
        headers: await headers(),
    });

  if (!session?.user?.id) {
    return <div>Você precisa estar logado para acessar esta página</div>
  }

  // Busca todos os workspaces do usuário
  const workspaces = await prisma.areaTrabalho.findMany({
    where: {
      usuariosAreas: {
        some: {
          usuario_id: session.user.id
        }
      }
    },
    include: {
      usuariosAreas: {
        where: {
          usuario_id: session.user.id
        },
        select: {
          nivel_permissao: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Áreas de Trabalho</h1>
        <Link href="/workspace-management/new">
          <Button variant="default">
            Nova Área de Trabalho
          </Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não tem nenhuma área de trabalho</p>
          <Link href="/workspace-management/new">
            <Button>Criar primeira área</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard 
              key={workspace.id}
              workspace={workspace}
              userPermissionLevel={workspace.usuariosAreas[0]?.nivel_permissao || 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}