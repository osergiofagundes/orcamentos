import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'

// GET /api/workspaces/[workspaceId] - Detalhes do workspace
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
        const workspace = await prisma.areaTrabalho.findUnique({
            where: {
                id: parseInt(workspaceId),
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
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const { nome, descricao, cpf_cnpj, telefone, email, endereco, bairro, cidade, estado, cep } = await req.json()

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

        const updatedWorkspace = await prisma.areaTrabalho.update({
            where: { id: parseInt(workspaceId) },
            data: { 
                nome, 
                descricao, 
                cpf_cnpj,
                telefone,
                email,
                endereco,
                bairro,
                cidade,
                estado,
                cep
            }
        })

        return NextResponse.json(updatedWorkspace)
    } catch (error) {
        console.error('Error updating workspace:', error)
        return NextResponse.json(
            { error: 'Failed to update workspace' },
            { status: 500 }
        )
    }
}

// DELETE /api/workspaces/[workspaceId] - Deletar workspace
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

    const { workspaceId } = await params

    try {
        // Verifica se usuário tem permissão de owner
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId),
                nivel_permissao: 3 // Nível de dono
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Com cascade delete configurado, a exclusão dos registros relacionados acontece automaticamente
        await prisma.areaTrabalho.delete({
            where: { id: parseInt(workspaceId) }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting workspace:', error)
        return NextResponse.json(
            { error: 'Failed to delete workspace' },
            { status: 500 }
        )
    }
}