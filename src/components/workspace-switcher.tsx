"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type Workspace = {
  id: number
  nome: string
  logo_url?: string | null
}

export function WorkspaceSwitcher({
  workspaces,
}: {
  workspaces: Workspace[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const params = useParams()
  const currentWorkspaceId = params.workspaceId as string
  
  const activeWorkspace = workspaces.find(w => w.id.toString() === currentWorkspaceId) || workspaces[0]

  const handleWorkspaceChange = (workspaceId: number) => {
    router.push(`/${workspaceId}/dashboard`)
  }

  if (!activeWorkspace) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sky-600 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                {activeWorkspace.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeWorkspace.logo_url}
                    alt={`Logo ${activeWorkspace.nome}`}
                    className="object-cover w-full h-full"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        e.currentTarget.style.display = 'none'
                        const fallback = parent.querySelector('.workspace-fallback') as HTMLElement
                        if (fallback) {
                          fallback.style.display = 'block'
                        }
                      }
                    }}
                  />
                ) : null}
                <span 
                  className={`text-xs font-semibold workspace-fallback ${activeWorkspace.logo_url ? 'hidden' : ''}`}
                >
                  {activeWorkspace.nome.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeWorkspace.nome}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceChange(workspace.id)}
                className="gap-2 p-2"
              >
                <div className="bg-sky-600 flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                  {workspace.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={workspace.logo_url}
                      alt={`Logo ${workspace.nome}`}
                      className="object-cover w-full h-full"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const parent = e.currentTarget.parentElement
                        if (parent) {
                          e.currentTarget.style.display = 'none'
                          const fallback = parent.querySelector('.workspace-dropdown-fallback') as HTMLElement
                          if (fallback) {
                            fallback.style.display = 'block'
                          }
                        }
                      }}
                    />
                  ) : null}
                  <span className={`text-white text-xs font-semibold workspace-dropdown-fallback ${workspace.logo_url ? 'hidden' : ''}`}>
                    {workspace.nome.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{workspace.nome}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push('/workspace-management')}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Adicionar Área de Trabalho
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
