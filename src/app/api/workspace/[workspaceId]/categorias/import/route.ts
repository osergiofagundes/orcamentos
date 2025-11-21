import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/categorias/import - Importar categorias em lote
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
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        if (!userAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Verificar se usuário tem permissão para criar categorias (nível 2 ou superior)
        if (userAccess.nivel_permissao < 2) {
            return NextResponse.json({ 
                error: 'Você não tem permissão para importar categorias. Necessário nível de acesso 2 ou superior.' 
            }, { status: 403 })
        }

        const body = await req.json()
        const { categorias } = body

        if (!Array.isArray(categorias) || categorias.length === 0) {
            return NextResponse.json(
                { error: 'Lista de categorias inválida' },
                { status: 400 }
            )
        }

        const results = {
            success: 0,
            errors: [] as string[],
            total: categorias.length
        }

        // Processa cada categoria
        for (let i = 0; i < categorias.length; i++) {
            const categoriaData = categorias[i]

            try {
                // Validação básica
                if (!categoriaData.nome || categoriaData.nome.trim() === '') {
                    results.errors.push(`Linha ${i + 2}: Nome é obrigatório`)
                    continue
                }

                const nome = categoriaData.nome.trim()

                // Validação de tamanho máximo
                if (nome.length > 50) {
                    results.errors.push(
                        `Linha ${i + 2}: "${nome}" - Nome excede 50 caracteres`
                    )
                    continue
                }

                // Verificar se já existe uma categoria com o mesmo nome neste workspace
                const existingCategory = await prisma.categoria.findFirst({
                    where: {
                        nome: nome,
                        area_trabalho_id: parseInt(workspaceId),
                        deletedAt: null
                    }
                })

                if (existingCategory) {
                    results.errors.push(
                        `Linha ${i + 2}: "${nome}" - Já existe uma categoria com este nome`
                    )
                    continue
                }

                // Cria a categoria
                await prisma.categoria.create({
                    data: {
                        nome: nome,
                        area_trabalho_id: parseInt(workspaceId)
                    }
                })

                results.success++
            } catch (error: any) {
                console.error(`Erro ao importar categoria linha ${i + 2}:`, error)
                results.errors.push(
                    `Linha ${i + 2}: ${categoriaData.nome} - ${error.message || 'Erro desconhecido'}`
                )
            }
        }

        return NextResponse.json(results, { status: 200 })
    } catch (error) {
        console.error('Failed to import categories:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor ao importar categorias' },
            { status: 500 }
        )
    }
}

