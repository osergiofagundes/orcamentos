import { prisma } from '@/lib/prisma'
import { WorkspaceListClient } from './_components/workspace-list-client'
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

  return <WorkspaceListClient initialWorkspaces={workspaces} userId={session.user.id} />
}