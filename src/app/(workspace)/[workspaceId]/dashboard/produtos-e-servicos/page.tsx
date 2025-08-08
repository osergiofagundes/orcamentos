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
import { ProductsTab } from "./_components/products-tab"
import { CategoriesTab } from "./_components/categories-tab"

interface PageProps {
  params: Promise<{ workspaceId: string }>
}

export default async function ProdutosServicosPage({ params }: PageProps) {
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
                  <BreadcrumbPage>Produtos & Serviços</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Cabeçalho da página */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Produtos & Serviços</h1>
            <p className="text-muted-foreground">
              Gerencie seu catálogo completo de produtos, serviços e categorias em um só lugar
            </p>
          </div>

          {/* Sistema de abas */}
          <Tabs defaultValue="produtos" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="produtos" className="data-[state=active]:bg-background">
                  Produtos & Serviços
                </TabsTrigger>
                <TabsTrigger value="categorias" className="data-[state=active]:bg-background">
                  Categorias
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="produtos" className="mt-6">
              <ProductsTab workspaceId={workspaceId} />
            </TabsContent>
            
            <TabsContent value="categorias" className="mt-6">
              <CategoriesTab workspaceId={workspaceId} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
