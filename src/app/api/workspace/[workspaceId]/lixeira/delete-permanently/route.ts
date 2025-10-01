import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/lixeira/delete-permanently - Excluir item permanentemente
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

        const { id, type, force = false } = await req.json()

        if (!id || !type) {
            return NextResponse.json({ error: 'Missing id or type' }, { status: 400 })
        }

        switch (type) {
            case 'cliente':
                // Verificar se há orçamentos relacionados (incluindo os excluídos)
                const clienteOrcamentosAtivos = await prisma.orcamento.count({
                    where: { 
                        cliente_id: parseInt(id),
                        deletedAt: null
                    }
                })

                const clienteOrcamentosExcluidos = await prisma.orcamento.count({
                    where: { 
                        cliente_id: parseInt(id),
                        deletedAt: { not: null }
                    }
                })

                const totalOrcamentos = clienteOrcamentosAtivos + clienteOrcamentosExcluidos

                if (totalOrcamentos > 0 && !force) {
                    return NextResponse.json({ 
                        error: 'CLIENT_HAS_BUDGETS',
                        message: `Este cliente possui ${totalOrcamentos} orçamento(s) vinculado(s).`,
                        details: {
                            activeBudgets: clienteOrcamentosAtivos,
                            deletedBudgets: clienteOrcamentosExcluidos,
                            totalBudgets: totalOrcamentos
                        }
                    }, { status: 400 })
                }

                // Se force = true, deletar todos os orçamentos relacionados primeiro
                if (force && totalOrcamentos > 0) {
                    await prisma.$transaction(async (tx) => {
                        // Buscar todos os orçamentos do cliente
                        const orcamentosDoCliente = await tx.orcamento.findMany({
                            where: { cliente_id: parseInt(id) }
                        })

                        // Deletar itens de orçamento primeiro
                        for (const orcamento of orcamentosDoCliente) {
                            await tx.itemOrcamento.deleteMany({
                                where: { orcamento_id: orcamento.id }
                            })
                        }

                        // Depois deletar os orçamentos
                        await tx.orcamento.deleteMany({
                            where: { cliente_id: parseInt(id) }
                        })
                    })
                }

                await prisma.cliente.delete({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId),
                        deletedAt: { not: null }
                    }
                })
                break

            case 'orcamento':
                // Primeiro deletar os itens do orçamento
                await prisma.itemOrcamento.deleteMany({
                    where: { orcamento_id: parseInt(id) }
                })
                
                // Depois deletar o orçamento
                await prisma.orcamento.delete({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId),
                        deletedAt: { not: null }
                    }
                })
                break

            case 'produto':
                // Verificar se há itens de orçamento relacionados
                const produtoItens = await prisma.itemOrcamento.count({
                    where: { produto_servico_id: parseInt(id) }
                })

                if (produtoItens > 0 && !force) {
                    return NextResponse.json({ 
                        error: 'PRODUCT_HAS_BUDGET_ITEMS',
                        message: `Este produto/serviço está sendo usado em ${produtoItens} item(ns) de orçamento.`,
                        details: {
                            budgetItems: produtoItens
                        }
                    }, { status: 400 })
                }

                // Se force = true, deletar todos os itens de orçamento relacionados primeiro
                if (force && produtoItens > 0) {
                    await prisma.itemOrcamento.deleteMany({
                        where: { produto_servico_id: parseInt(id) }
                    })
                }

                await prisma.produtoServico.delete({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId),
                        deletedAt: { not: null }
                    }
                })
                break

            case 'categoria':
                // Verificar se há produtos relacionados
                const categoriaProdutosAtivos = await prisma.produtoServico.count({
                    where: { 
                        categoria_id: parseInt(id),
                        deletedAt: null
                    }
                })

                const categoriaProdutosExcluidos = await prisma.produtoServico.count({
                    where: { 
                        categoria_id: parseInt(id),
                        deletedAt: { not: null }
                    }
                })

                const totalProdutos = categoriaProdutosAtivos + categoriaProdutosExcluidos

                if (totalProdutos > 0 && !force) {
                    return NextResponse.json({ 
                        error: 'CATEGORY_HAS_PRODUCTS',
                        message: `Esta categoria possui ${totalProdutos} produto(s)/serviço(s) vinculado(s).`,
                        details: {
                            activeProducts: categoriaProdutosAtivos,
                            deletedProducts: categoriaProdutosExcluidos,
                            totalProducts: totalProdutos
                        }
                    }, { status: 400 })
                }

                // Se force = true, deletar todos os produtos relacionados primeiro
                if (force && totalProdutos > 0) {
                    await prisma.$transaction(async (tx) => {
                        // Buscar produtos da categoria
                        const produtosDaCategoria = await tx.produtoServico.findMany({
                            where: { categoria_id: parseInt(id) }
                        })

                        // Deletar itens de orçamento dos produtos primeiro
                        for (const produto of produtosDaCategoria) {
                            await tx.itemOrcamento.deleteMany({
                                where: { produto_servico_id: produto.id }
                            })
                        }

                        // Depois deletar os produtos
                        await tx.produtoServico.deleteMany({
                            where: { categoria_id: parseInt(id) }
                        })
                    })
                }

                await prisma.categoria.delete({
                    where: { 
                        id: parseInt(id),
                        area_trabalho_id: parseInt(workspaceId),
                        deletedAt: { not: null }
                    }
                })
                break



            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json({ message: 'Item deleted permanently' })
    } catch (error) {
        console.error('Failed to delete item permanently:', error)
        return NextResponse.json(
            { error: 'Failed to delete item permanently' },
            { status: 500 }
        )
    }
}