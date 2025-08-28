"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface WorkspaceInfoProps {
    workspace: {
        id: number
        nome: string
        createdAt: Date
        updatedAt: Date
        criador: {
            id: string
            name: string
            email: string
        } | null
        totalParticipantes: number
    }
}

export function WorkspaceInfo({ workspace }: WorkspaceInfoProps) {
    const [copied, setCopied] = useState(false)

    const copyWorkspaceId = async () => {
        try {
            await navigator.clipboard.writeText(workspace.id.toString())
            setCopied(true)
            toast.success("ID do workspace copiado!")
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Erro ao copiar ID")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informações do Workspace</CardTitle>
                <CardDescription>
                    Detalhes técnicos e identificadores do workspace
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">ID do Workspace</div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                                {workspace.id}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyWorkspaceId}
                                className="h-8 w-8 p-0"
                            >
                                {copied ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Nome</div>
                        <div className="text-sm">{workspace.nome}</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Criado por
                        </div>
                        <div className="text-sm">
                            {workspace.criador ? (
                                <div className="flex flex-col">
                                    <span className="font-medium">{workspace.criador.name}</span>
                                    <span className="text-xs text-muted-foreground">{workspace.criador.email}</span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground">Não identificado</span>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Participantes
                        </div>
                        <div className="text-sm">
                            <Badge variant="secondary">
                                {workspace.totalParticipantes} {workspace.totalParticipantes === 1 ? 'participante' : 'participantes'}
                            </Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Criado em</div>
                        <div className="text-sm">
                            {workspace.createdAt.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">Última atualização</div>
                        <div className="text-sm">
                            {workspace.updatedAt.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
