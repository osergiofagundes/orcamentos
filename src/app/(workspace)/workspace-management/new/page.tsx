'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";

export default function NewWorkspacePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        cpf_cnpj: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/workspace', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Falha ao criar área de trabalho')
            }

            const newWorkspace = await response.json()

            toast.success('Área de trabalho criada com sucesso.');

            // Redireciona para a página do novo workspace
            router.push(`/${newWorkspace.id}/dashboard`)
        } catch (error) {
            toast.error('Ocorreu um erro ao criar a área de trabalho.');
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Criar Nova Área de Trabalho</h1>
                <p className="text-muted-foreground">
                    Configure uma nova área para gerenciar seus clientes e orçamentos
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Área de Trabalho *</Label>
                    <Input
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Ex: Meu Negócio"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                        id="descricao"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        placeholder="Descreva o propósito desta área de trabalho"
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                    <Input
                        id="cpf_cnpj"
                        name="cpf_cnpj"
                        value={formData.cpf_cnpj}
                        onChange={handleChange}
                        placeholder="Opcional - para identificação"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/workspace-management')}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Criando...' : 'Criar Área de Trabalho'}
                    </Button>
                </div>
            </form>
        </div>
    )
}