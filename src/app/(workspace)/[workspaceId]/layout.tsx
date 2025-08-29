import { verifyWorkspaceAccess } from "@/lib/workspace-access"

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params
  
  // Verificar se o usuário tem acesso ao workspace
  // Se não tiver, será redirecionado automaticamente para /workspace-management
  await verifyWorkspaceAccess(workspaceId)

  return <>{children}</>
}
