import { prisma } from '@/lib/prisma'
import { TrashListClient } from './_components/trash-list-client'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'
import { WorkspaceManagementNavbar } from '@/components/workspace-management-navbar'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'

export default async function WorkspaceTrashPage() {
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

  // Busca todos os workspaces na lixeira do usuário
  const trashedWorkspaces = await prisma.areaTrabalho.findMany({
    where: {
      usuariosAreas: {
        some: {
          usuario_id: session.user.id
        }
      },
      inTrash: true // Apenas workspaces na lixeira
    },
    select: {
      id: true,
      nome: true,
      cpf_cnpj: true,
      telefone: true,
      email: true,
      endereco: true,
      bairro: true,
      cidade: true,
      estado: true,
      cep: true,
      logo_url: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      inTrash: true,
      trashedAt: true,
      trashedBy: true,
      usuariosAreas: {
        where: {
          usuario_id: session.user.id
        },
        select: {
          nivel_permissao: true
        }
      },
      usuarioQueMoveuParaLixeira: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      trashedAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <WorkspaceManagementNavbar user={user} />
      <Separator />
      {/* Conteúdo principal */}
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        <TrashListClient initialTrashedWorkspaces={trashedWorkspaces} userId={session.user.id} />
      </main>
    </div>
  )
}