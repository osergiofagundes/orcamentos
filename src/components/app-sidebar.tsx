"use client"

import * as React from "react"
import {
  HandCoins,
  LayoutDashboard,
  Sprout,
  Tag,
  UserRound,
  Package,
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
  ],
}

type Workspace = {
  id: number
  nome: string
  descricao?: string
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
  return (
    <Sidebar collapsible="icon" {...props}>
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
