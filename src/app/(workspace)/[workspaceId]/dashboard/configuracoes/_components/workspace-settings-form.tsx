"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface WorkspaceInfo {
    id: number
    nome: string
    descricao?: string | null
    cpf_cnpj?: string | null
    endereco?: string | null
    bairro?: string | null
    cidade?: string | null
    estado?: string | null
    cep?: string | null
}

interface WorkspaceSettingsFormProps {
    workspace: WorkspaceInfo
    canEdit: boolean
}

export function WorkspaceSettingsForm({ workspace, canEdit }: WorkspaceSettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nome: workspace.nome || "",
        descricao: workspace.descricao || "",
        cpf_cnpj: workspace.cpf_cnpj || "",
        endereco: workspace.endereco || "",
        bairro: workspace.bairro || "",
        cidade: workspace.cidade || "",
        estado: workspace.estado || "",
        cep: workspace.cep || "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch(`/api/workspace/${workspace.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to update workspace')
            }

            const updatedWorkspace = await response.json()
            
            toast.success("Workspace atualizado com sucesso!")
        } catch (error) {
            toast.error("Não foi possível atualizar o workspace. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Informações do Workspace</CardTitle>
                <CardDescription>
                    Gerencie as informações básicas do seu workspace
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome *</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => handleInputChange("nome", e.target.value)}
                                placeholder="Nome do workspace"
                                required
                                disabled={!canEdit}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                            <Input
                                id="cpf_cnpj"
                                value={formData.cpf_cnpj}
                                onChange={(e) => handleInputChange("cpf_cnpj", e.target.value)}
                                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                disabled={!canEdit}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => handleInputChange("descricao", e.target.value)}
                            placeholder="Descrição do workspace"
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="endereco">Endereço</Label>
                                <Input
                                    id="endereco"
                                    value={formData.endereco}
                                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                                    placeholder="Rua, número, complemento"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input
                                    id="bairro"
                                    value={formData.bairro}
                                    onChange={(e) => handleInputChange("bairro", e.target.value)}
                                    placeholder="Bairro"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    value={formData.cep}
                                    onChange={(e) => handleInputChange("cep", e.target.value)}
                                    placeholder="00000-000"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input
                                    id="cidade"
                                    value={formData.cidade}
                                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                                    placeholder="Cidade"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Input
                                    id="estado"
                                    value={formData.estado}
                                    onChange={(e) => handleInputChange("estado", e.target.value)}
                                    placeholder="Estado"
                                    disabled={!canEdit}
                                />
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
