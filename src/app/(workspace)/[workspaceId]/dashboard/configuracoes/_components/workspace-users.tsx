"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { UserPlus, MoreHorizontal, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface User {
    id: string
    name: string
    email: string
    image?: string
}

interface WorkspaceUser {
    id: number
    usuario_id: string
    area_trabalho_id: number
    nivel_permissao: number
    createdAt: string
    updatedAt: string
    usuario: User
}

interface WorkspaceUsersProps {
    workspaceId: string
    currentUserId: string
    canManageUsers: boolean
}

const getPermissionLabel = (level: number) => {
    switch (level) {
        case 1:
            return { label: "Usuário Nível 1", color: "bg-blue-100 text-blue-800" }
        case 2:
            return { label: "Usuário Nível 2", color: "bg-purple-100 text-purple-800" }
        case 3:
            return { label: "Usuário Nível 3", color: "bg-green-100 text-green-800" }
        default:
            return { label: "Desconhecido", color: "bg-gray-100 text-gray-800" }
    }
}

const getPermissionDescription = (level: number) => {
    switch (level) {
        case 1:
            return "Pode visualizar e criar orçamentos"
        case 2:
            return "Pode gerenciar produtos, categorias e clientes"
        case 3:
            return "Controle total do workspace"
        default:
            return "Nível de permissão desconhecido"
    }
}

export function WorkspaceUsers({ workspaceId, currentUserId, canManageUsers }: WorkspaceUsersProps) {
    const [users, setUsers] = useState<WorkspaceUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isAddingUser, setIsAddingUser] = useState(false)
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserPermission, setNewUserPermission] = useState("1")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const fetchUsers = async () => {
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/users`)
            if (!response.ok) throw new Error('Failed to fetch users')
            const data = await response.json()
            setUsers(data)
        } catch (error) {
            toast.error("Erro ao carregar usuários")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [workspaceId])

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsAddingUser(true)

        try {
            const response = await fetch(`/api/workspace/${workspaceId}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: newUserEmail,
                    nivel_permissao: parseInt(newUserPermission)
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to add user')
            }

            const newUser = await response.json()
            setUsers(prev => [...prev, newUser])
            setNewUserEmail("")
            setNewUserPermission("1")
            setIsAddDialogOpen(false)
            toast.success("Usuário adicionado com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao adicionar usuário")
        } finally {
            setIsAddingUser(false)
        }
    }

    const handleUpdatePermission = async (userId: string, newPermission: number) => {
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nivel_permissao: newPermission
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update user')
            }

            const updatedUser = await response.json()
            setUsers(prev => prev.map(user => 
                user.usuario_id === userId ? updatedUser : user
            ))
            toast.success("Permissões atualizadas com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao atualizar permissões")
        }
    }

    const handleRemoveUser = async (userId: string) => {
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/users/${userId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to remove user')
            }

            setUsers(prev => prev.filter(user => user.usuario_id !== userId))
            toast.success("Usuário removido com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao remover usuário")
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Usuários do Workspace</CardTitle>
                    <CardDescription>Carregando usuários...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Usuários do Workspace</CardTitle>
                        <CardDescription>
                            Gerencie quem tem acesso ao workspace e seus níveis de permissão
                        </CardDescription>
                    </div>
                    {canManageUsers && (
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Adicionar Usuário
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Adicionar Usuário</DialogTitle>
                                    <DialogDescription>
                                        Adicione um novo usuário ao workspace
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddUser} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email do usuário</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newUserEmail}
                                            onChange={(e) => setNewUserEmail(e.target.value)}
                                            placeholder="usuario@exemplo.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="permission">Nível de Permissão</Label>
                                        <Select value={newUserPermission} onValueChange={setNewUserPermission}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">
                                                    <div>
                                                        <div className="font-medium">Usuário Nível 1</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Pode visualizar/criar orçamentos e gerenciar clientes
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="2">
                                                    <div>
                                                        <div className="font-medium">Usuário Nível 2</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Pode gerenciar produtos, categorias e todos os orçamentos
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="3">
                                                    <div>
                                                        <div className="font-medium">Usuário Nível 3</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Controle total do workspace
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAddDialogOpen(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={isAddingUser}>
                                            {isAddingUser ? "Adicionando..." : "Adicionar"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => {
                        const permission = getPermissionLabel(user.nivel_permissao)
                        const isCurrentUser = user.usuario_id === currentUserId
                        
                        return (
                            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.usuario.image} alt={user.usuario.name} />
                                        <AvatarFallback>
                                            {user.usuario.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {user.usuario.name}
                                            {isCurrentUser && (
                                                <span className="text-sm text-muted-foreground ml-2">(Você)</span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.usuario.email}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {getPermissionDescription(user.nivel_permissao)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={permission.color}>
                                        {permission.label}
                                    </Badge>
                                    {canManageUsers && !isCurrentUser && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleUpdatePermission(user.usuario_id, 1)}
                                                    disabled={user.nivel_permissao === 1}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Usuário Nível 1
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleUpdatePermission(user.usuario_id, 2)}
                                                    disabled={user.nivel_permissao === 2}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Usuário Nível 2
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleUpdatePermission(user.usuario_id, 3)}
                                                    disabled={user.nivel_permissao === 3}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Usuário Nível 3
                                                </DropdownMenuItem>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem
                                                            onSelect={(e) => e.preventDefault()}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Remover
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tem certeza que deseja remover {user.usuario.name} do workspace?
                                                                Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleRemoveUser(user.usuario_id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Remover
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
