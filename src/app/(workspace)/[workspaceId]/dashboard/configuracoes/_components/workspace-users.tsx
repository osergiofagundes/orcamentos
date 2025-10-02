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
import { UserPlus, MoreHorizontal, Trash2, Edit, Copy, Check, Users, Clock, KeyRound, Loader2 } from "lucide-react"
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

interface PendingRequest {
    id: number
    usuario_id: string
    convite_id: number
    mensagem?: string
    createdAt: string
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
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGeneratingCode, setIsGeneratingCode] = useState(false)
    const [inviteCode, setInviteCode] = useState("")
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)

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

    const fetchPendingRequests = async () => {
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/invite-requests`)
            if (!response.ok) throw new Error('Failed to fetch pending requests')
            const data = await response.json()
            setPendingRequests(data)
        } catch (error) {
            console.error("Erro ao carregar solicitações pendentes:", error)
        }
    }

    useEffect(() => {
        fetchUsers()
        if (canManageUsers) {
            fetchPendingRequests()
        }
    }, [workspaceId, canManageUsers])

    const generateInviteCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsGeneratingCode(true)

        try {
            const response = await fetch(`/api/workspace/${workspaceId}/invite-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nivel_permissao: 1
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to generate invite code')
            }

            const data = await response.json()
            setInviteCode(data.codigo)
            toast.success("Código de convite gerado com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao gerar código de convite")
        } finally {
            setIsGeneratingCode(false)
        }
    }

    const copyInviteCode = async () => {
        await navigator.clipboard.writeText(inviteCode)
        setCopiedCode(true)
        toast.success("Código copiado!")
        setTimeout(() => setCopiedCode(false), 2000)
    }

    const handleApproveRequest = async (requestId: number) => {
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/invite-requests/${requestId}/approve`, {
                method: 'POST',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to approve request')
            }

            setPendingRequests(prev => prev.filter(req => req.id !== requestId))
            fetchUsers() // Atualizar lista de usuários
            toast.success("Solicitação aprovada com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao aprovar solicitação")
        }
    }

    const handleRejectRequest = async (requestId: number) => {
        try {
            const response = await fetch(`/api/workspace/${workspaceId}/invite-requests/${requestId}/reject`, {
                method: 'POST',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to reject request')
            }

            setPendingRequests(prev => prev.filter(req => req.id !== requestId))
            toast.success("Solicitação rejeitada com sucesso!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao rejeitar solicitação")
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Usuários do Workspace</CardTitle>
                            <CardDescription className="hidden sm:block">
                                Gerencie quem tem acesso ao workspace e seus níveis de permissão
                            </CardDescription>
                        </div>
                        {canManageUsers && (
                            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-sky-600 hover:bg-sky-700 cursor-pointer text-white hover:text-white">
                                        Convidar Participantes
                                        <Users className="h-4 w-4 mr-2" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600">
                                    <DialogHeader>
                                        <DialogTitle>Convidar Participantes</DialogTitle>
                                        <DialogDescription>
                                            Gere um código de convite para que outros usuários possam solicitar entrada no workspace.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {!inviteCode ? (
                                        <form onSubmit={generateInviteCode} className="space-y-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsInviteDialogOpen(false)}
                                                    className='border hover:text-red-500 hover:border-red-500 cursor-pointer'
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" disabled={isGeneratingCode} className='bg-sky-600 hover:bg-sky-700 cursor-pointer'>
                                                    {isGeneratingCode ? (<>Gerando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Gerar Código <KeyRound className="h-4 w-4" /></>)} 
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Código de Convite</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={inviteCode}
                                                        readOnly
                                                        className="font-mono text-sm"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={copyInviteCode}
                                                        variant="outline"
                                                        className="cursor-pointer"
                                                    >
                                                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Compartilhe este código com a pessoa que deseja convidar.
                                                    O código expira em 7 dias.
                                                </p>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() => {
                                                        setInviteCode("")
                                                        setIsInviteDialogOpen(false)
                                                    }}
                                                    className='bg-sky-600 hover:bg-sky-700 cursor-pointer'
                                                >
                                                    Fechar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
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
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Avatar className="flex-shrink-0">
                                            <AvatarImage src={user.usuario.image} alt={user.usuario.name} />
                                            <AvatarFallback>
                                                {user.usuario.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                                {user.usuario.name}
                                                {isCurrentUser && (
                                                    <span className="text-sm text-muted-foreground ml-2">(Você)</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground truncate">
                                                {user.usuario.email}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
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

            {canManageUsers && pendingRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Solicitações Pendentes
                        </CardTitle>
                        <CardDescription>
                            Usuários que solicitaram entrada no workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={request.usuario.image} alt={request.usuario.name} />
                                            <AvatarFallback>
                                                {request.usuario.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{request.usuario.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {request.usuario.email}
                                            </div>
                                            {request.mensagem && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    "{request.mensagem}"
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                Solicitado em {new Date(request.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Rejeitar
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApproveRequest(request.id)}
                                        >
                                            Aprovar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
