import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// GET /api/workspace/[workspaceId]/users - Listar usuários do workspace
export async function GET(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await params

    try {
        // Verifica se usuário tem acesso ao workspace
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId),
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const users = await prisma.usuarioAreaTrabalho.findMany({
            where: {
                area_trabalho_id: parseInt(workspaceId),
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
            },
            orderBy: {
                nivel_permissao: 'desc'
            }
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching workspace users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workspace users' },
            { status: 500 }
        )
    }
}

// POST /api/workspace/[workspaceId]/users - Adicionar usuário ao workspace
export async function POST(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const { email, nivel_permissao } = await req.json()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await params

    try {
        // Verifica se usuário tem permissão de nível 3 (Owner)
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId),
                nivel_permissao: { gte: 3 } // Apenas Nível 3
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Buscar usuário pelo email
        const targetUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Verificar se usuário já está no workspace
        const existingAccess = await prisma.usuarioAreaTrabalho.findUnique({
            where: {
                usuario_id_area_trabalho_id: {
                    usuario_id: targetUser.id,
                    area_trabalho_id: parseInt(workspaceId)
                }
            }
        })

        if (existingAccess) {
            return NextResponse.json({ error: 'User already in workspace' }, { status: 400 })
        }

        // Adicionar usuário ao workspace
        const newUserAccess = await prisma.usuarioAreaTrabalho.create({
            data: {
                usuario_id: targetUser.id,
                area_trabalho_id: parseInt(workspaceId),
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

        return NextResponse.json(newUserAccess)
    } catch (error) {
        console.error('Error adding user to workspace:', error)
        return NextResponse.json(
            { error: 'Failed to add user to workspace' },
            { status: 500 }
        )
    }
}
