"use client"

import { useState } from "react"
import {
  User,
  ChevronsUpDown,
  LogOut,
  Home,
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
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auh-client"
import { useRouter } from "next/navigation"
import { UserProfileModal } from "./user-profile-modal"
import Link from "next/link"

export function WorkspaceManagementNavbar({
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

  return (
    <nav className="w-full border-b bg-white dark:bg-background py-4">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src="/images/logo.png" alt='Logo' />
            </Avatar>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-primary hidden xs:block">Sky Orçamentos</span>
            <span className="font-bold text-lg tracking-tight text-primary xs:hidden">Sky Orçamentos</span>
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3 py-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left text-sm leading-tight hidden sm:block">
                <span className="truncate font-medium">{user.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
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
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User />
                Perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <Link href="/">
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer">
                  <Home />
                  Início
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      
      <UserProfileModal 
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
        user={user}
        canChangePassword={canChangePassword}
      />
    </nav>
  )
}