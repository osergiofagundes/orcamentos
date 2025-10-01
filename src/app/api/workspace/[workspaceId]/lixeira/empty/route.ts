import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/lixeira/empty - Esvaziar lixeira
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

        let deletedCount = 0

        // Executar em transação
        await prisma.$transaction(async (tx) => {
            // 1. Primeiro, buscar todos os orçamentos excluídos para deletar seus itens
            const orcamentosExcluidos = await tx.orcamento.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null }
                }
            })

            // 2. Deletar itens de orçamento primeiro (dependência)
            for (const orcamento of orcamentosExcluidos) {
                await tx.itemOrcamento.deleteMany({
                    where: { orcamento_id: orcamento.id }
                })
            }

            // 3. Deletar orçamentos excluídos
            const deletedOrcamentos = await tx.orcamento.deleteMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null }
                }
            })
            deletedCount += deletedOrcamentos.count

            // 4. Deletar produtos/serviços excluídos (verificando dependências)
            const produtosExcluidos = await tx.produtoServico.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null }
                }
            })

            for (const produto of produtosExcluidos) {
                // Verificar se ainda há itens de orçamento ativos que referenciam este produto
                const itensAtivos = await tx.itemOrcamento.count({
                    where: {
                        produto_servico_id: produto.id,
                        orcamento: {
                            deletedAt: null
                        }
                    }
                })

                if (itensAtivos === 0) {
                    await tx.produtoServico.delete({
                        where: { id: produto.id }
                    })
                    deletedCount++
                }
            }

            // 5. Deletar categorias excluídas (verificando dependências)
            const categoriasExcluidas = await tx.categoria.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null }
                }
            })

            for (const categoria of categoriasExcluidas) {
                // Verificar se ainda há produtos ativos que referenciam esta categoria
                const produtosAtivos = await tx.produtoServico.count({
                    where: {
                        categoria_id: categoria.id,
                        deletedAt: null
                    }
                })

                if (produtosAtivos === 0) {
                    await tx.categoria.delete({
                        where: { id: categoria.id }
                    })
                    deletedCount++
                }
            }

            // 6. Deletar clientes excluídos (verificando dependências)
            const clientesExcluidos = await tx.cliente.findMany({
                where: {
                    area_trabalho_id: parseInt(workspaceId),
                    deletedAt: { not: null }
                }
            })

            for (const cliente of clientesExcluidos) {
                // Verificar se ainda há orçamentos ativos que referenciam este cliente
                const orcamentosAtivos = await tx.orcamento.count({
                    where: {
                        cliente_id: cliente.id,
                        deletedAt: null
                    }
                })

                if (orcamentosAtivos === 0) {
                    await tx.cliente.delete({
                        where: { id: cliente.id }
                    })
                    deletedCount++
                }
            }
        })



        return NextResponse.json({ 
            message: 'Trash emptied successfully',
            deletedCount
        })
    } catch (error) {
        console.error('Failed to empty trash:', error)
        console.error('Error details:', error instanceof Error ? error.message : error)
        return NextResponse.json(
            { 
                error: 'Failed to empty trash',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}