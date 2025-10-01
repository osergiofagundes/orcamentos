import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// DELETE /api/workspace/[workspaceId]/permanent - Excluir workspace permanentemente
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId: workspaceIdStr } = await params
    const workspaceId = parseInt(workspaceIdStr)

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
                nivel_permissao: 3 // Apenas donos podem excluir permanentemente
            }
        })

        if (!userPermission) {
            return NextResponse.json(
                { error: 'Permission denied. Only workspace owners can permanently delete.' },
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
                { error: 'Workspace must be in trash before permanent deletion' },
                { status: 400 }
            )
        }

        // Exclui o workspace permanentemente
        // O Prisma cuidará das relações com onDelete: Cascade
        await prisma.areaTrabalho.delete({
            where: { id: workspaceId }
        })

        return NextResponse.json({
            message: 'Workspace permanently deleted successfully',
            workspaceId: workspaceId
        })
    } catch (error) {
        console.error('Error permanently deleting workspace:', error)
        return NextResponse.json(
            { error: 'Failed to permanently delete workspace' },
            { status: 500 }
        )
    }
}