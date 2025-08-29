import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/**
 * Verifica se o usuário atual tem acesso ao workspace especificado
 * @param workspaceId - ID do workspace a ser verificado
 * @returns Os dados do acesso do usuário se válido
 * @throws Redireciona para /workspace-management se não tiver acesso
 */
export async function verifyWorkspaceAccess(workspaceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    redirect("/signin")
  }

  // Verificar se o usuário tem acesso ao workspace
  const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
    where: {
      usuario_id: session.user.id,
      area_trabalho_id: parseInt(workspaceId),
    },
    include: {
      areaTrabalho: true,
    },
  })

  if (!userAccess) {
    redirect("/workspace-management")
  }

  return {
    user: session.user,
    access: userAccess,
    workspace: userAccess.areaTrabalho,
  }
}

/**
 * Verifica se o usuário tem um nível de permissão específico no workspace
 * @param workspaceId - ID do workspace
 * @param requiredLevel - Nível de permissão mínimo necessário (1, 2 ou 3)
 * @returns Os dados do acesso se o usuário tiver o nível necessário
 * @throws Redireciona para /workspace-management se não tiver o nível necessário
 */
export async function verifyWorkspacePermission(workspaceId: string, requiredLevel: number) {
  const accessData = await verifyWorkspaceAccess(workspaceId)

  if (accessData.access.nivel_permissao < requiredLevel) {
    redirect("/workspace-management")
  }

  return accessData
}
