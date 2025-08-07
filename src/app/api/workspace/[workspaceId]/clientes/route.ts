import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// GET /api/workspace/[workspaceId]/clientes - Listar clientes
export async function GET(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    
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

        const clientes = await prisma.cliente.findMany({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: null
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(clientes)
    } catch (error) {
        console.error('Failed to fetch clients:', error)
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        )
    }
}

// POST /api/workspace/[workspaceId]/clientes - Criar cliente
export async function POST(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    
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

        const { nome, cpf_cnpj, telefone, email, endereco } = await req.json()

        // Verificar se CPF/CNPJ já existe no workspace
        const existingClient = await prisma.cliente.findFirst({
            where: {
                cpf_cnpj,
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: null
            }
        })

        if (existingClient) {
            return NextResponse.json(
                { error: 'Cliente com este CPF/CNPJ já existe' },
                { status: 400 }
            )
        }

        const cliente = await prisma.cliente.create({
            data: {
                nome,
                cpf_cnpj,
                telefone,
                email,
                endereco,
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        return NextResponse.json(cliente, { status: 201 })
    } catch (error) {
        console.error('Failed to create client:', error)
        return NextResponse.json(
            { error: 'Failed to create client' },
            { status: 500 }
        )
    }
}
