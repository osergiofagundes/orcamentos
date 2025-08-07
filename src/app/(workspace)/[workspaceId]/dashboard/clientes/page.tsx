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
import { ClientsStats, ClientsList, CreateClientButton } from "./_components"

interface PageProps {
  params: Promise<{ workspaceId: string }>
}

export default async function ClientesPage({ params }: PageProps) {
  const { workspaceId } = await params

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
                  <BreadcrumbPage>Clientes</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div className="grid gap-1">
              <h1 className="text-2xl font-semibold">Clientes</h1>
              <p className="text-muted-foreground">
                Gerencie seus clientes e acompanhe estatísticas importantes
              </p>
            </div>
            <CreateClientButton workspaceId={workspaceId} />
          </div>

          <ClientsStats workspaceId={workspaceId} />
          <ClientsList workspaceId={workspaceId} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
