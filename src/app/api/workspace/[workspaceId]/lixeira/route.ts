import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// GET /api/workspace/[workspaceId]/lixeira - Obter itens da lixeira
export async function GET(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const { workspaceId } = await params
    const url = new URL(req.url)
    const search = url.searchParams.get('search') || ''
    const type = url.searchParams.get('type') || 'all'
    
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

        const items: any[] = []

        // Buscar clientes excluídos
        if (type === 'all' || type === 'clientes') {
            const clientes = await prisma.cliente.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null },
                    ...(search && {
                        nome: { contains: search, mode: 'insensitive' }
                    })
                },
                include: {
                    usuarioQueExcluiu: {
                        select: { name: true }
                    }
                },
                orderBy: { deletedAt: 'desc' }
            })

            clientes.forEach(cliente => {
                items.push({
                    id: cliente.id.toString(),
                    type: 'cliente' as const,
                    name: cliente.nome,
                    deletedAt: cliente.deletedAt!.toISOString(),
                    deletedBy: cliente.deletedBy || '',
                    deletedByName: cliente.usuarioQueExcluiu?.name || 'Usuário desconhecido',
                    originalData: cliente
                })
            })
        }

        // Buscar orçamentos excluídos
        if (type === 'all' || type === 'orcamentos') {
            const orcamentos = await prisma.orcamento.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null },
                },
                include: {
                    cliente: true,
                    usuarioQueExcluiu: {
                        select: { name: true }
                    }
                },
                orderBy: { deletedAt: 'desc' }
            })

            orcamentos.forEach(orcamento => {
                const name = `Orçamento #${orcamento.id} - ${orcamento.cliente.nome}`
                if (!search || name.toLowerCase().includes(search.toLowerCase())) {
                    items.push({
                        id: orcamento.id.toString(),
                        type: 'orcamento' as const,
                        name,
                        deletedAt: orcamento.deletedAt!.toISOString(),
                        deletedBy: orcamento.deletedBy || '',
                        deletedByName: orcamento.usuarioQueExcluiu?.name || 'Usuário desconhecido',
                        originalData: orcamento
                    })
                }
            })
        }

        // Buscar produtos/serviços excluídos
        if (type === 'all' || type === 'produtos') {
            const produtos = await prisma.produtoServico.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null },
                    ...(search && {
                        nome: { contains: search, mode: 'insensitive' }
                    })
                },
                include: {
                    usuarioQueExcluiu: {
                        select: { name: true }
                    }
                },
                orderBy: { deletedAt: 'desc' }
            })

            produtos.forEach(produto => {
                items.push({
                    id: produto.id.toString(),
                    type: 'produto' as const,
                    name: produto.nome,
                    deletedAt: produto.deletedAt!.toISOString(),
                    deletedBy: produto.deletedBy || '',
                    deletedByName: produto.usuarioQueExcluiu?.name || 'Usuário desconhecido',
                    originalData: produto
                })
            })
        }

        // Buscar categorias excluídas
        if (type === 'all' || type === 'categorias') {
            const categorias = await prisma.categoria.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null },
                    ...(search && {
                        nome: { contains: search, mode: 'insensitive' }
                    })
                },
                include: {
                    usuarioQueExcluiu: {
                        select: { name: true }
                    }
                },
                orderBy: { deletedAt: 'desc' }
            })

            categorias.forEach(categoria => {
                items.push({
                    id: categoria.id.toString(),
                    type: 'categoria' as const,
                    name: categoria.nome,
                    deletedAt: categoria.deletedAt!.toISOString(),
                    deletedBy: categoria.deletedBy || '',
                    deletedByName: categoria.usuarioQueExcluiu?.name || 'Usuário desconhecido',
                    originalData: categoria
                })
            })
        }



        // Ordenar todos os itens por data de exclusão (mais recente primeiro)
        items.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime())

        return NextResponse.json({ items })
    } catch (error) {
        console.error('Failed to fetch trash items:', error)
        return NextResponse.json(
            { error: 'Failed to fetch trash items' },
            { status: 500 }
        )
    }
}