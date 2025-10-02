"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LogoUpload } from "@/components/ui/logo-upload"
import { toast } from "sonner"
import { formatCpfCnpj, formatCep, formatPhone, validateCpfCnpj } from "@/lib/formatters"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ESTADOS_BRASILEIROS } from "@/lib/constants"
import { Save, Copy, Check, User, Users, Loader2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface WorkspaceInfo {
    id: number
    nome: string
    cpf_cnpj?: string | null
    telefone?: string | null
    email?: string | null
    endereco?: string | null
    bairro?: string | null
    cidade?: string | null
    estado?: string | null
    cep?: string | null
    logo_url?: string | null
    createdAt?: Date
    updatedAt?: Date
    criador?: {
        id: string
        name: string
        email: string
    } | null
    totalParticipantes?: number
}

interface WorkspaceSettingsFormProps {
    workspace: WorkspaceInfo
    canEdit: boolean
}

export function WorkspaceSettingsForm({ workspace, canEdit }: WorkspaceSettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [formData, setFormData] = useState({
        nome: workspace.nome || "",
        cpf_cnpj: workspace.cpf_cnpj || "",
        telefone: workspace.telefone || "",
        email: workspace.email || "",
        endereco: workspace.endereco || "",
        bairro: workspace.bairro || "",
        cidade: workspace.cidade || "",
        estado: workspace.estado || "",
        cep: workspace.cep || "",
    })
    const [errors, setErrors] = useState({
        nome: "",
        cpf_cnpj: "",
        telefone: "",
        email: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validação
        const newErrors = {
            nome: "",
            cpf_cnpj: "",
            telefone: "",
            email: "",
        }
        
        if (!formData.nome.trim()) {
            newErrors.nome = "Nome é obrigatório"
        }
        
        if (formData.cpf_cnpj && !validateCpfCnpj(formData.cpf_cnpj)) {
            newErrors.cpf_cnpj = "CPF/CNPJ inválido"
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email inválido"
        }
        
        setErrors(newErrors)
        
        // Se há erros, não submete
        if (newErrors.nome || newErrors.cpf_cnpj || newErrors.telefone || newErrors.email) {
            return
        }
        
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
        
        // Limpa erro quando o usuário começa a digitar
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }))
        }
    }

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
                    Gerencie as informações básicas do seu workspace
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="mb-6">
                    <Label htmlFor="nome" className="mb-2">Logo do Workspace</Label>
                    <LogoUpload
                        workspaceId={workspace.id}
                        currentLogoUrl={workspace.logo_url}
                        canEdit={canEdit}
                    />
                </div>
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Workspace*</Label>
                                <Input
                                    id="nome"
                                    value={formData.nome}
                                    onChange={(e) => handleInputChange("nome", e.target.value)}
                                    placeholder="Nome do workspace"
                                    required
                                    disabled={!canEdit}
                                    className={errors.nome ? "border-red-500" : ""}
                                />
                                {errors.nome && (
                                    <p className="text-sm text-red-600">{errors.nome}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                                <Input
                                    id="cpf_cnpj"
                                    value={formData.cpf_cnpj}
                                    onChange={(e) => {
                                        const formatted = formatCpfCnpj(e.target.value)
                                        handleInputChange("cpf_cnpj", formatted)
                                    }}
                                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    disabled={!canEdit}
                                    className={errors.cpf_cnpj ? "border-red-500" : ""}
                                />
                                {errors.cpf_cnpj && (
                                    <p className="text-sm text-red-600">{errors.cpf_cnpj}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input
                                    id="telefone"
                                    value={formData.telefone}
                                    onChange={(e) => {
                                        const formatted = formatPhone(e.target.value)
                                        handleInputChange("telefone", formatted)
                                    }}
                                    placeholder="(00) 00000-0000"
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    placeholder="contato@empresa.com"
                                    disabled={!canEdit}
                                    className={errors.email ? "border-red-500" : ""}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
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
                                        onChange={(e) => {
                                            const formatted = formatCep(e.target.value)
                                            handleInputChange("cep", formatted)
                                        }}
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
                                    <div>
                                        <Select
                                            value={formData.estado}
                                            onValueChange={(value) => handleInputChange("estado", value)}
                                            disabled={!canEdit}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione o estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ESTADOS_BRASILEIROS.map((estado) => (
                                                    <SelectItem key={estado.sigla} value={estado.sigla}>
                                                        {estado.sigla} - {estado.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {canEdit && (
                            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 cursor-pointer text-white hover:text-white">
                                {isLoading ? (<>Salvando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Salvar Alterações <Edit className="h-4 w-4" /></>)}
                            </Button>
                        )}
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
