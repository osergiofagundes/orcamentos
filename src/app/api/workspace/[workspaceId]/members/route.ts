import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// GET /api/workspaces/[workspaceId]/members - Listar membros
export async function GET(
    req: Request,
    { params }: { params: { workspaceId: string } }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verifica se usuário tem acesso ao workspace
        const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(params.workspaceId)
            }
        })

        if (!hasAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const members = await prisma.usuarioAreaTrabalho.findMany({
            where: {
                area_trabalho_id: parseInt(params.workspaceId)
            },
            include: {
                usuario: true
            }
        })

        return NextResponse.json(members)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch members' },
            { status: 500 }
        )
    }
}

// POST /api/workspaces/[workspaceId]/members - Adicionar membro
export async function POST(
    req: Request,
    { params }: { params: { workspaceId: string } }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const { email, nivel_permissao } = await req.json()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verifica se usuário tem permissão para adicionar membros (admin ou owner)
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(params.workspaceId),
                nivel_permissao: { gte: 2 } // Nível de admin ou owner
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Busca usuário pelo email
        const userToAdd = await prisma.user.findUnique({
            where: { email }
        })

        if (!userToAdd) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Adiciona usuário ao workspace
        const newMember = await prisma.usuarioAreaTrabalho.create({
            data: {
                usuario_id: userToAdd.id,
                area_trabalho_id: parseInt(params.workspaceId),
                nivel_permissao
            },
            include: {
                usuario: true
            }
        })

        return NextResponse.json(newMember, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to add member' },
            { status: 500 }
        )
    }
}