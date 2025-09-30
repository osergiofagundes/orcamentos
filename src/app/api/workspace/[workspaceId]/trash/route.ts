import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/trash - Mover workspace para lixeira
export async function POST(
    req: Request,
    { params }: { params: { workspaceId: string } }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workspaceId = parseInt(params.workspaceId)

    if (isNaN(workspaceId)) {
        return NextResponse.json(
            { error: 'Invalid workspace ID' },
            { status: 400 }
        )
    }

    try {
        // Verifica se o usuário tem permissão para gerenciar o workspace (nível 3 = dono)
        const userPermission = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: workspaceId,
                nivel_permissao: 3 // Apenas donos podem mover para lixeira
            }
        })

        if (!userPermission) {
            return NextResponse.json(
                { error: 'Permission denied. Only workspace owners can move to trash.' },
                { status: 403 }
            )
        }

        // Verifica se o workspace existe e não está já na lixeira
        const workspace = await prisma.areaTrabalho.findUnique({
            where: { id: workspaceId },
            select: { id: true, inTrash: true, nome: true }
        })

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace not found' },
                { status: 404 }
            )
        }

        if (workspace.inTrash) {
            return NextResponse.json(
                { error: 'Workspace is already in trash' },
                { status: 400 }
            )
        }

        // Move o workspace para a lixeira
        const updatedWorkspace = await prisma.areaTrabalho.update({
            where: { id: workspaceId },
            data: {
                inTrash: true,
                trashedAt: new Date(),
                trashedBy: session.user.id
            },
            select: {
                id: true,
                nome: true,
                inTrash: true,
                trashedAt: true
            }
        })

        return NextResponse.json({
            message: 'Workspace moved to trash successfully',
            workspace: updatedWorkspace
        })
    } catch (error) {
        console.error('Error moving workspace to trash:', error)
        return NextResponse.json(
            { error: 'Failed to move workspace to trash' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspace/[workspaceId]/trash - Restaurar workspace da lixeira
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

    const workspaceId = parseInt(params.workspaceId)

    if (isNaN(workspaceId)) {
        return NextResponse.json(
            { error: 'Invalid workspace ID' },
            { status: 400 }
        )
    }

    try {
        // Verifica se o usuário tem permissão para gerenciar o workspace (nível 3 = dono)
        const userPermission = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: workspaceId,
                nivel_permissao: 3 // Apenas donos podem restaurar
            }
        })

        if (!userPermission) {
            return NextResponse.json(
                { error: 'Permission denied. Only workspace owners can restore from trash.' },
                { status: 403 }
            )
        }

        // Verifica se o workspace existe e está na lixeira
        const workspace = await prisma.areaTrabalho.findUnique({
            where: { id: workspaceId },
            select: { id: true, inTrash: true, nome: true }
        })

        if (!workspace) {
            return NextResponse.json(
                { error: 'Workspace not found' },
                { status: 404 }
            )
        }

        if (!workspace.inTrash) {
            return NextResponse.json(
                { error: 'Workspace is not in trash' },
                { status: 400 }
            )
        }

        // Restaura o workspace da lixeira
        const restoredWorkspace = await prisma.areaTrabalho.update({
            where: { id: workspaceId },
            data: {
                inTrash: false,
                trashedAt: null,
                trashedBy: null
            },
            select: {
                id: true,
                nome: true,
                inTrash: true
            }
        })

        return NextResponse.json({
            message: 'Workspace restored from trash successfully',
            workspace: restoredWorkspace
        })
    } catch (error) {
        console.error('Error restoring workspace from trash:', error)
        return NextResponse.json(
            { error: 'Failed to restore workspace from trash' },
            { status: 500 }
        )
    }
}