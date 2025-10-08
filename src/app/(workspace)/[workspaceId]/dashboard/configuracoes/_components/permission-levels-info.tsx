"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Edit, Settings } from "lucide-react"

export function PermissionLevelsInfo() {
    const permissionLevels = [
        {
            level: 1,
            name: "Usuário Nível 1",
            color: "bg-blue-100 text-blue-800",
            icon: Eye,
            description: "Acesso básico ao sistema",
            permissions: [
                "Visualizar orçamentos",
                "Criar orçamentos",
                "Editar próprios orçamentos",
                "Visualizar clientes",
                "Cadastrar clientes",
                "Editar clientes",
                "Visualizar produtos e serviços",
                "Visualizar categorias"
            ]
        },
        {
            level: 2,
            name: "Usuário Nível 2",
            color: "bg-purple-100 text-purple-800",
            icon: Edit,
            description: "Acesso de gerenciamento",
            permissions: [
                "Todas as permissões do Nível 1",
                "Gerenciar produtos e serviços",
                "Gerenciar categorias",
                "Gerenciar clientes",
                "Gerenciar todos os orçamentos"
            ]
        },
        {
            level: 3,
            name: "Usuário Nível 3",
            color: "bg-green-100 text-green-800",
            icon: Settings,
            description: "Controle total da Área de trabalho",
            permissions: [
                "Todas as permissões dos níveis anteriores",
                "Gerenciar configurações da Área de trabalho",
                "Adicionar/remover usuários",
                "Alterar permissões de usuários",
                "Excluir Área de trabalho"
            ]
        }
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Níveis de Permissão
                </CardTitle>
                <CardDescription>
                    Entenda os diferentes níveis de acesso da Área de trabalho
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {permissionLevels.map((level) => {
                    const IconComponent = level.icon
                    return (
                        <div key={level.level} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                    <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className={level.color}>
                                            {level.name}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {level.description}
                                    </p>
                                </div>
                            </div>
                            <div className="ml-11">
                                <div className="text-sm font-medium mb-2">Permissões:</div>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {level.permissions.map((permission, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-green-600 mt-0.5">•</span>
                                            <span>{permission}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
