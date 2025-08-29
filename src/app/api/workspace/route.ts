import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// GET /api/workspaces - Listar workspaces do usuário
export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const workspaces = await prisma.areaTrabalho.findMany({
            where: {
                usuariosAreas: {
                    some: {
                        usuario_id: session.user.id
                    }
                }
            },
            select: {
                id: true,
                nome: true,
                cpf_cnpj: true,
                endereco: true,
                bairro: true,
                cidade: true,
                estado: true,
                cep: true,
                logo_url: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
                usuariosAreas: {
                    where: {
                        usuario_id: session.user.id
                    },
                    select: {
                        nivel_permissao: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(workspaces)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch workspaces' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces - Criar novo workspace
export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const { nome, cpf_cnpj } = await req.json()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const newWorkspace = await prisma.areaTrabalho.create({
            data: {
                nome,
                cpf_cnpj,
                usuariosAreas: {
                    create: {
                        usuario_id: session.user.id,
                        nivel_permissao: 3 // Nível de dono
                    }
                }
            }
        })

        return NextResponse.json(newWorkspace, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create workspace' },
            { status: 500 }
        )
    }
}