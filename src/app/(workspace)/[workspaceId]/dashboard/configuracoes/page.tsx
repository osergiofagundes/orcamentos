import { WorkspaceAppSidebar } from "@/components/workspace-app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkspaceSettingsForm } from "./_components/workspace-settings-form"
import { WorkspaceUsers } from "./_components/workspace-users"
import { PermissionLevelsInfo } from "./_components/permission-levels-info"
import { prisma } from "@/lib/prisma"
import { verifyWorkspacePermission } from "@/lib/workspace-access"

interface PageProps {
    params: Promise<{ workspaceId: string }>
}

export default async function ConfiguracoesPage({ params }: PageProps) {
    const { workspaceId } = await params
    
    // Verificar se o usuário tem permissão de nível 3 (gerenciar workspace)
    const { user, access, workspace } = await verifyWorkspacePermission(workspaceId, 3)

    // Buscar informações adicionais do workspace
    const workspaceWithDetails = await prisma.areaTrabalho.findFirst({
        where: {
            id: parseInt(workspaceId)
        },
        include: {
            usuariosAreas: {
                include: {
                    usuario: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    })

    const userPermission = access.nivel_permissao
    const canEdit = userPermission >= 3 // Apenas Owner (Nível 3)
    const canManageUsers = userPermission >= 3 // Apenas Owner (Nível 3)

    // Preparar dados do workspace com informações extras
    const workspaceData = {
        ...workspace,
        criador: workspaceWithDetails?.usuariosAreas[0]?.usuario || null, // Primeiro usuário é o criador
        totalParticipantes: workspaceWithDetails?.usuariosAreas.length || 0
    }

    return (
        <SidebarProvider>
            <WorkspaceAppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href={`/${workspaceId}/dashboard`}>
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Configurações</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                                <p className="hidden text-muted-foreground sm:block">
                                    Gerencie as configurações do seu espaço de trabalho
                                </p>
                            </div>
                        </div>
                        
                        <Tabs defaultValue="workspace" className="space-y-6">
                            <TabsList className="gap-2">
                                <TabsTrigger value="workspace" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white cursor-pointer">Área de trabalho</TabsTrigger>
                                <TabsTrigger value="users" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white cursor-pointer">Usuários</TabsTrigger>
                                <TabsTrigger value="permissions" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white cursor-pointer">Permissões</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="workspace" className="space-y-6">
                                <WorkspaceSettingsForm 
                                    workspace={workspace} 
                                    canEdit={canEdit}
                                />
                            </TabsContent>
                            
                            <TabsContent value="users" className="space-y-6">
                                <WorkspaceUsers 
                                    workspaceId={workspaceId}
                                    currentUserId={user.id}
                                    canManageUsers={canManageUsers}
                                />
                            </TabsContent>
                            
                            <TabsContent value="permissions" className="space-y-6">
                                <PermissionLevelsInfo />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}