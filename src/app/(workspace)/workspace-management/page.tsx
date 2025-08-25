import { prisma } from '@/lib/prisma'
import { WorkspaceListClient } from './_components/workspace-list-client'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'
import { WorkspaceManagementNavbar } from '@/components/workspace-management-navbar'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function WorkspaceManagementPage() {
  const session = await auth.api.getSession({
        headers: await headers(),
    });

  if (!session?.user?.id) {
    redirect('/signin')
  }

  // Busca dados do usuário para o menu
  const user = {
    name: session.user.name || 'Usuário',
    email: session.user.email || '',
    avatar: session.user.image || '/avatars/default.jpg',
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
    select: {
      id: true,
      nome: true,
      descricao: true,
      cpf_cnpj: true,
      endereco: true,
      bairro: true,
      cidade: true,
      estado: true,
      cep: true,
      logo_url: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <WorkspaceManagementNavbar user={user} />
      <Separator />
      {/* Conteúdo principal */}
      <main className="flex-1">
        <WorkspaceListClient initialWorkspaces={workspaces} userId={session.user.id} />
      </main>
    </div>
  )
}