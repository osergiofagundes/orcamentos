"use client"

import { useState } from "react"
import {
  User,
  ChevronsUpDown,
  LogOut,
  Building2,
  Undo2,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { authClient } from "@/lib/auh-client"
import { useRouter } from "next/navigation"
import { UserProfileModal } from "./user-profile-modal"

export function NavUser({
  user,
  canChangePassword = true,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  canChangePassword?: boolean
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push("/signin")
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleProfileClick = () => {
    setIsProfileModalOpen(true)
  }

  const handleWorkspaceManagement = () => {
    router.push("/workspace-management")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleWorkspaceManagement} className="cursor-pointer">
                <Undo2 />
                Voltar para Áreas de Trabalho
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      
      <UserProfileModal 
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        user={user}
        canChangePassword={canChangePassword}
      />
    </SidebarMenu>
  )
}
