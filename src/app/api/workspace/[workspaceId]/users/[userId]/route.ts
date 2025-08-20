import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// PUT /api/workspace/[workspaceId]/users/[userId] - Atualizar permissões do usuário
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const { nivel_permissao } = await req.json()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, userId } = await params

    try {
        // Verifica se usuário tem permissão de nível 2+
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId),
                nivel_permissao: { gte: 2 } // Nível 2 ou 3
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Não permitir que o próprio usuário altere suas permissões
        if (session.user.id === userId) {
            return NextResponse.json({ error: 'Cannot change own permissions' }, { status: 400 })
        }

        // Buscar o acesso atual do usuário alvo
        const targetUserAccess = await prisma.usuarioAreaTrabalho.findUnique({
            where: {
                usuario_id_area_trabalho_id: {
                    usuario_id: userId,
                    area_trabalho_id: parseInt(workspaceId)
                }
            }
        })

        if (!targetUserAccess) {
            return NextResponse.json({ error: 'User not found in workspace' }, { status: 404 })
        }

        // Apenas usuários nível 3 podem alterar permissões de outros nível 2/3
        if (targetUserAccess.nivel_permissao >= 2 && userAccess.nivel_permissao < 3) {
            return NextResponse.json({ error: 'Only level 3 users can change level 2+ permissions' }, { status: 403 })
        }

        const updatedAccess = await prisma.usuarioAreaTrabalho.update({
            where: {
                usuario_id_area_trabalho_id: {
                    usuario_id: userId,
                    area_trabalho_id: parseInt(workspaceId)
                }
            },
            data: {
                nivel_permissao: nivel_permissao
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            }
        })

        return NextResponse.json(updatedAccess)
    } catch (error) {
        console.error('Error updating user permissions:', error)
        return NextResponse.json(
            { error: 'Failed to update user permissions' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspace/[workspaceId]/users/[userId] - Remover usuário do workspace
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, userId } = await params

    try {
        // Verifica se usuário tem permissão de nível 2+
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId),
                nivel_permissao: { gte: 2 } // Nível 2 ou 3
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Não permitir que o próprio usuário se remova
        if (session.user.id === userId) {
            return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
        }

        // Buscar o acesso atual do usuário alvo
        const targetUserAccess = await prisma.usuarioAreaTrabalho.findUnique({
            where: {
                usuario_id_area_trabalho_id: {
                    usuario_id: userId,
                    area_trabalho_id: parseInt(workspaceId)
                }
            }
        })

        if (!targetUserAccess) {
            return NextResponse.json({ error: 'User not found in workspace' }, { status: 404 })
        }

        // Apenas usuários nível 3 podem remover outros nível 2/3
        if (targetUserAccess.nivel_permissao >= 2 && userAccess.nivel_permissao < 3) {
            return NextResponse.json({ error: 'Only level 3 users can remove level 2+ users' }, { status: 403 })
        }

        await prisma.usuarioAreaTrabalho.delete({
            where: {
                usuario_id_area_trabalho_id: {
                    usuario_id: userId,
                    area_trabalho_id: parseInt(workspaceId)
                }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error removing user from workspace:', error)
        return NextResponse.json(
            { error: 'Failed to remove user from workspace' },
            { status: 500 }
        )
    }
}
