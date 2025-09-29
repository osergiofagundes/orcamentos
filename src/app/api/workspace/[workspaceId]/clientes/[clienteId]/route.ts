import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library'

// GET /api/workspace/[workspaceId]/clientes/[clienteId] - Obter cliente específico
export async function GET(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; clienteId: string }> }
) {
    const { workspaceId, clienteId } = await params
    
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verifica se usuário tem acesso ao workspace
        const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const cliente = await prisma.cliente.findFirst({
            where: {
                id: parseInt(clienteId),
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: null
            }
        })

        if (!cliente) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        return NextResponse.json(cliente)
    } catch (error) {
        console.error('Failed to fetch client:', error)
        return NextResponse.json(
            { error: 'Failed to fetch client' },
            { status: 500 }
        )
    }
}

// PUT /api/workspace/[workspaceId]/clientes/[clienteId] - Atualizar cliente
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; clienteId: string }> }
) {
    const { workspaceId, clienteId } = await params
    
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verifica se usuário tem acesso ao workspace
        const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { nome, cpf_cnpj, telefone, email, endereco, bairro, cidade, estado, cep } = await req.json()

        // Verificar se o cliente existe
        const existingClient = await prisma.cliente.findFirst({
            where: {
                id: parseInt(clienteId),
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: null
            }
        })

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Validação básica - apenas nome é obrigatório
        if (!nome || nome.trim() === '') {
            return NextResponse.json(
                { error: 'Nome é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se CPF/CNPJ já existe em outro cliente (apenas se CPF/CNPJ foi fornecido)
        if (cpf_cnpj && cpf_cnpj.trim() !== '') {
            const duplicateClient = await prisma.cliente.findFirst({
                where: {
                    cpf_cnpj,
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: null,
                    id: { not: parseInt(clienteId) }
                }
            })

            if (duplicateClient) {
                return NextResponse.json(
                    { error: 'Outro cliente com este CPF/CNPJ já existe' },
                    { status: 400 }
                )
            }
        }

        const cliente = await prisma.cliente.update({
            where: {
                id: parseInt(clienteId)
            },
            data: {
                nome: nome.trim(),
                cpf_cnpj: cpf_cnpj && cpf_cnpj.trim() !== '' ? cpf_cnpj : null,
                telefone: telefone && telefone.trim() !== '' ? telefone : null,
                email: email && email.trim() !== '' ? email : null,
                endereco: endereco && endereco.trim() !== '' ? endereco : null,
                bairro: bairro && bairro.trim() !== '' ? bairro : null,
                cidade: cidade && cidade.trim() !== '' ? cidade : null,
                estado: estado && estado.trim() !== '' ? estado : null,
                cep: cep && cep.trim() !== '' ? cep : null,
            }
        })

        return NextResponse.json(cliente)
    } catch (error) {
        console.error('Failed to update client:', error)
        
        return NextResponse.json(
            { error: 'Erro interno do servidor ao atualizar cliente' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspace/[workspaceId]/clientes/[clienteId] - Excluir cliente (soft delete)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; clienteId: string }> }
) {
    const { workspaceId, clienteId } = await params
    
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verifica se usuário tem acesso ao workspace
        const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Verificar se o cliente existe
        const existingClient = await prisma.cliente.findFirst({
            where: {
                id: parseInt(clienteId),
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: null
            }
        })

        if (!existingClient) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Soft delete
        await prisma.cliente.update({
            where: {
                id: parseInt(clienteId)
            },
            data: {
                deletedAt: new Date()
            }
        })

        return NextResponse.json({ message: 'Client deleted successfully' })
    } catch (error) {
        console.error('Failed to delete client:', error)
        return NextResponse.json(
            { error: 'Failed to delete client' },
            { status: 500 }
        )
    }
}
