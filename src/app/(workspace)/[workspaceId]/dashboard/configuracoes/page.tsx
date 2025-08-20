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
import { WorkspaceInfo } from "./_components/workspace-info"
import { PermissionLevelsInfo } from "./_components/permission-levels-info"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

interface PageProps {
    params: Promise<{ workspaceId: string }>
}

export default async function ConfiguracoesPage({ params }: PageProps) {
    const { workspaceId } = await params
    
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        redirect('/signin')
    }

    // Buscar informações do workspace e permissões do usuário
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
        where: {
            usuario_id: session.user.id,
            area_trabalho_id: parseInt(workspaceId),
        },
        include: {
            areaTrabalho: true
        }
    })

    if (!userAccess) {
        redirect('/workspace-management')
    }

    const workspace = userAccess.areaTrabalho
    const userPermission = userAccess.nivel_permissao
    const canEdit = userPermission >= 2 // Admin ou Owner
    const canManageUsers = userPermission >= 2 // Admin ou Owner

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
                                <p className="text-muted-foreground">
                                    Gerencie as configurações do seu espaço de trabalho
                                </p>
                            </div>
                        </div>
                        
                        <Tabs defaultValue="workspace" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="workspace">Workspace</TabsTrigger>
                                <TabsTrigger value="users">Usuários</TabsTrigger>
                                <TabsTrigger value="info">Informações</TabsTrigger>
                                <TabsTrigger value="permissions">Permissões</TabsTrigger>
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
                                    currentUserId={session.user.id}
                                    canManageUsers={canManageUsers}
                                />
                            </TabsContent>
                            
                            <TabsContent value="info" className="space-y-6">
                                <WorkspaceInfo workspace={workspace} />
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