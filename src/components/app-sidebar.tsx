"use client"

import * as React from "react"
import {
  HandCoins,
  LayoutDashboard,
  Sprout,
  Tag,
  UserRound,
  Package,
  Settings,
  ChartArea
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Dashboard",
      url: "",
      icon: LayoutDashboard,
    },
    {
      name: "Clientes",
      url: "clientes",
      icon: UserRound,
    },
    {
      name: "Produtos & Serviços",
      url: "produtos-e-servicos",
      icon: Package,
    },
    {
      name: "Categorias",
      url: "categorias",
      icon: Tag,
    },
    {
      name: "Orçamentos",
      url: "orcamentos",
      icon: HandCoins,
    },
    {
      name: "Relatórios",
      url: "relatorios",
      icon: ChartArea,
    },
    {
      name: "Configurações",
      url: "configuracoes",
      icon: Settings,
    },
  ],
}

type Workspace = {
  id: number
  nome: string
  logo_url?: string | null
}

type User = {
  name: string
  email: string
  avatar: string
}

export function AppSidebar({ 
  workspaces = [],
  user,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  workspaces?: Workspace[]
  user?: User
}) {
  const userData = user || data.user;
  const { open } = useSidebar();
  
  return (
    <Sidebar collapsible="icon" {...props}>
      {open && (
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-sky-600 justify-center rounded-lg m-2">
          <img 
            src="/images/logo.png" 
            alt="Sky Orçamentos Logo" 
            className="h-8 w-8 rounded"
          />
          <span className="font-semibold text-lg text-white">
            Sky Orçamentos
          </span>
        </div>
      )}
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
