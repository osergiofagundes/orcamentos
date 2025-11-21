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
  ChartArea,
  Trash,
  Trash2
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

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
      name: "Lixeira",
      url: "lixeira",
      icon: Trash2,
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
  canChangePassword = true,
  isGoogleUser = false,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  workspaces?: Workspace[]
  user?: User
  canChangePassword?: boolean
  isGoogleUser?: boolean
}) {
  const userData = user || data.user;
  const { open } = useSidebar();
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {open ? (
          <div className="flex items-center gap-2 px-2 py-2 border-b bg-sky-600 justify-center rounded-lg">
            <img 
              src="/images/logo.png" 
              alt="Sky Orçamentos Logo" 
              className="h-8 w-8 rounded"
            />
            <span className="font-semibold text-lg text-white">
              Sky Orçamentos
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src="/images/logo.png" alt="Sky orcamentos logo" />
            </Avatar>
          </div>
        )}
      </SidebarHeader>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} canChangePassword={canChangePassword} isGoogleUser={isGoogleUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
