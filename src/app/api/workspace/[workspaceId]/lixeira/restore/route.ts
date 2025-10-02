import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/lixeira/restore - Restaurar item da lixeira
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

        const { id, type } = await req.json()

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
        }

        switch (type) {
            case 'cliente':
                await prisma.cliente.update({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId)
                    },
                    data: { 
                        deletedAt: null,
                        deletedBy: null
                    }
                })
                break

            case 'orcamento':
                await prisma.orcamento.update({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId)
                    },
                    data: { 
                        deletedAt: null,
                        deletedBy: null
                    }
                })
                break

            case 'produto':
                await prisma.produtoServico.update({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId)
                    },
                    data: { 
                        deletedAt: null,
                        deletedBy: null
                    }
                })
                break

            case 'categoria':
                await prisma.categoria.update({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId)
                    },
                    data: { 
                        deletedAt: null,
                        deletedBy: null
                    }
                })
                break



            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Item restored successfully' })
    } catch (error) {
        console.error('Failed to restore item:', error)
        return NextResponse.json(
            { error: 'Failed to restore item' },
            { status: 500 }
        )
    }
}