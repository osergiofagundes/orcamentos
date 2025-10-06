import { prisma } from '@/lib/prisma'
import { WorkspaceListClient } from './_components/workspace-list-client'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'
import { WorkspaceManagementNavbar } from '@/components/workspace-management-navbar'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'
import { isGoogleUser, needsEmailVerification } from '@/lib/auth-utils'

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

  // Verificar se usuário fez login com Google
  const isGoogle = await isGoogleUser(session.user.id)
  const canChangePassword = !isGoogle
  
  // Verificar se o usuário precisa verificar o email
  const needsVerification = await needsEmailVerification(session.user.id)

  // Busca todos os workspaces do usuário (exceto os que estão na lixeira)
  const workspaces = await prisma.areaTrabalho.findMany({
    where: {
      usuariosAreas: {
        some: {
          usuario_id: session.user.id
        }
      },
      inTrash: false // Exclui workspaces na lixeira
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
      <WorkspaceManagementNavbar user={user} canChangePassword={canChangePassword} isGoogleUser={isGoogle} />
      <Separator />
      {/* Conteúdo principal */}
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        <WorkspaceListClient 
          initialWorkspaces={workspaces} 
          userId={session.user.id} 
          needsEmailVerification={needsVerification}
          userEmail={session.user.email || ''}
        />
      </main>
    </div>
  )
}