import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'
import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library'

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

        const body = await req.json()
        console.log('Request body:', body)
        
        const { nome, cpf_cnpj, telefone, email, endereco, bairro, cidade, estado, cep } = body

        // Validação básica - apenas nome é obrigatório
        if (!nome || nome.trim() === '') {
            console.log('Missing required field nome:', { nome: !!nome })
            return NextResponse.json(
                { error: 'Nome é obrigatório' },
                { status: 400 }
            )
        }

        // Verificar se CPF/CNPJ já existe no workspace (apenas se CPF/CNPJ foi fornecido)
        if (cpf_cnpj && cpf_cnpj.trim() !== '') {
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
        }

        const cliente = await prisma.cliente.create({
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
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        return NextResponse.json(cliente, { status: 201 })
    } catch (error) {
        console.error('Failed to create client:', error)
        
        return NextResponse.json(
            { error: 'Erro interno do servidor ao criar cliente' },
            { status: 500 }
        )
    }
}
