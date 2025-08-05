import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// GET /api/workspaces/[workspaceId] - Detalhes do workspace
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
        const workspace = await prisma.areaTrabalho.findUnique({
            where: {
                id: parseInt(params.workspaceId),
                usuariosAreas: {
                    some: {
                        usuario_id: session.user.id
                    }
                }
            },
            include: {
                usuariosAreas: {
                    include: {
                        usuario: true
                    }
                }
            }
        })

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
        }

        return NextResponse.json(workspace)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch workspace' },
            { status: 500 }
        )
    }
}

// PUT /api/workspaces/[workspaceId] - Atualizar workspace
export async function PUT(
    req: Request,
    { params }: { params: { workspaceId: string } }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const { nome, descricao, cpf_cnpj } = await req.json()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verifica se usuário tem permissão de owner
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(params.workspaceId),
                nivel_permissao: 3 // Nível de dono
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const updatedWorkspace = await prisma.areaTrabalho.update({
            where: { id: parseInt(params.workspaceId) },
            data: { nome, descricao, cpf_cnpj }
        })

        return NextResponse.json(updatedWorkspace)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update workspace' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[workspaceId] - Deletar workspace
export async function DELETE(
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
        // Verifica se usuário tem permissão de owner
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(params.workspaceId),
                nivel_permissao: 3 // Nível de dono
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.areaTrabalho.delete({
            where: { id: parseInt(params.workspaceId) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete workspace' },
            { status: 500 }
        )
    }
}