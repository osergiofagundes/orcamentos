"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { useParams, usePathname } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const { isMobile } = useSidebar()
  const params = useParams()
  const pathname = usePathname()
  const workspaceId = params.workspaceId as string

  const isActiveRoute = (projectUrl: string) => {
    const fullPath = `/${workspaceId}/dashboard${projectUrl ? `/${projectUrl}` : ''}`
    // Remove query parameters e hash para comparação mais limpa
    const cleanPathname = pathname.split('?')[0].split('#')[0]
    
    // Verifica se é a página exata ou uma subpágina
    if (projectUrl === '') {
      // Para dashboard, só considera ativo se for exatamente o path
      return cleanPathname === fullPath
    } else {
      // Para outras páginas, considera ativo se começar com o path
      return cleanPathname.startsWith(fullPath)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Páginas</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = isActiveRoute(item.url)
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
                className={isActive ? "!bg-sky-600 !text-white hover:!bg-sky-600 hover:!text-white [&>svg]:!text-white data-[active=true]:!bg-sky-600 data-[active=true]:!text-white" : ""}
              >
                <a href={`/${workspaceId}/dashboard${item.url ? `/${item.url}` : ''}`}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
