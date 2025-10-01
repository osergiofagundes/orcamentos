import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// GET /api/workspace/[workspaceId]/lixeira/stats - Obter estatísticas da lixeira
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

        // Contar clientes excluídos
        const clientes = await prisma.cliente.count({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: { not: null }
            }
        })

        // Contar orçamentos excluídos
        const orcamentos = await prisma.orcamento.count({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: { not: null }
            }
        })

        // Contar produtos/serviços excluídos
        const produtos = await prisma.produtoServico.count({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: { not: null }
            }
        })

        // Contar categorias excluídas
        const categorias = await prisma.categoria.count({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: { not: null }
            }
        })

        const totalItems = clientes + orcamentos + produtos + categorias

        return NextResponse.json({
            totalItems,
            clientes,
            orcamentos,
            produtos,
            categorias
        })
    } catch (error) {
        console.error('Failed to fetch trash stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch trash stats' },
            { status: 500 }
        )
    }
}