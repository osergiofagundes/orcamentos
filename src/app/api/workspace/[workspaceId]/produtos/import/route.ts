import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/produtos/import - Importar produtos em lote
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

        // Verificar se usuário tem permissão para criar produtos (nível 2 ou superior)
        if (userAccess.nivel_permissao < 2) {
            return NextResponse.json({ 
                error: 'Você não tem permissão para importar produtos e serviços. Necessário nível de acesso 2 ou superior.' 
            }, { status: 403 })
        }

        const body = await req.json()
        const { produtos } = body

        if (!Array.isArray(produtos) || produtos.length === 0) {
            return NextResponse.json(
                { error: 'Lista de produtos inválida' },
                { status: 400 }
            )
        }

        // Buscar todas as categorias do workspace para mapear nome -> id
        const categorias = await prisma.categoria.findMany({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                deletedAt: null
            }
        })

        const categoriaMap = new Map<string, number>()
        categorias.forEach(cat => {
            categoriaMap.set(cat.nome.toLowerCase().trim(), cat.id)
        })

        const results = {
            success: 0,
            errors: [] as string[],
            total: produtos.length
        }

        // Valida tipos permitidos
        const tiposPermitidos = ['PRODUTO', 'SERVICO']
        const tiposValorPermitidos = [
            'UNIDADE', 'METRO', 'METRO_QUADRADO', 'METRO_CUBICO', 'CENTIMETRO', 
            'DUZIA', 'QUILO', 'GRAMA', 'QUILOMETRO', 'LITRO', 'MINUTO', 
            'HORA', 'DIA', 'MES', 'ANO'
        ]

        // Processa cada produto
        for (let i = 0; i < produtos.length; i++) {
            const produtoData = produtos[i]

            try {
                // Validação básica
                if (!produtoData.nome || produtoData.nome.trim() === '') {
                    results.errors.push(`Linha ${i + 2}: Nome é obrigatório`)
                    continue
                }

                if (!produtoData.tipo || !tiposPermitidos.includes(produtoData.tipo)) {
                    results.errors.push(
                        `Linha ${i + 2}: Tipo inválido. Deve ser PRODUTO ou SERVICO`
                    )
                    continue
                }

                if (!produtoData.tipo_valor || !tiposValorPermitidos.includes(produtoData.tipo_valor)) {
                    results.errors.push(
                        `Linha ${i + 2}: Tipo de valor inválido`
                    )
                    continue
                }

                // Converter valor de string (formato decimal) para centavos
                let valorEmCentavos: number | null = null
                const valorOriginal = produtoData.valor?.trim() || ''
                
                if (valorOriginal === '') {
                    results.errors.push(
                        `Linha ${i + 2}: "${produtoData.nome}" - Valor não fornecido. Use formato decimal (ex: 100.50 ou 100,50)`
                    )
                    continue
                }
                
                try {
                    // Remove espaços
                    let valorStr = valorOriginal.replace(/\s/g, '')
                    
                    // Detecta formato: brasileiro (vírgula como decimal) ou internacional (ponto como decimal)
                    const temVirgula = valorStr.includes(',')
                    const temPonto = valorStr.includes('.')
                    
                    if (temVirgula && !temPonto) {
                        // Formato brasileiro: 100,50
                        valorStr = valorStr.replace(',', '.')
                    } else if (temVirgula && temPonto) {
                        // Tem ambos: precisa determinar qual é decimal
                        // Se vírgula vem depois do ponto, vírgula é decimal
                        // Se ponto vem depois da vírgula, ponto é decimal
                        const posVirgula = valorStr.lastIndexOf(',')
                        const posPonto = valorStr.lastIndexOf('.')
                        
                        if (posVirgula > posPonto) {
                            // Vírgula é decimal: 1.000,50 -> 1000.50
                            valorStr = valorStr.replace(/\./g, '').replace(',', '.')
                        } else {
                            // Ponto é decimal: 1,000.50 -> 1000.50
                            valorStr = valorStr.replace(/,/g, '')
                        }
                    }
                    // Se só tem ponto ou não tem nenhum, já está no formato correto
                    
                    // Remove qualquer caractere não numérico restante, exceto ponto
                    valorStr = valorStr.replace(/[^\d.]/g, '')
                    
                    // Valida que tem pelo menos um dígito
                    if (valorStr.length === 0 || valorStr === '.') {
                        throw new Error('Valor vazio após processamento')
                    }
                    
                    const valorDecimal = parseFloat(valorStr)
                    
                    if (isNaN(valorDecimal) || valorDecimal <= 0) {
                        throw new Error(`Valor decimal inválido: ${valorDecimal}`)
                    }
                    
                    valorEmCentavos = Math.round(valorDecimal * 100)
                    
                    if (valorEmCentavos <= 0) {
                        throw new Error('Valor em centavos deve ser maior que zero')
                    }
                } catch (error: any) {
                    console.error(`Erro ao converter valor "${valorOriginal}" para produto "${produtoData.nome}":`, error.message)
                    results.errors.push(
                        `Linha ${i + 2}: "${produtoData.nome}" - Valor inválido: "${valorOriginal}". Use formato decimal (ex: 100.50 ou 100,50)`
                    )
                    continue
                }

                // Mapear categoria
                let categoriaId: number | null = null
                if (produtoData.categoria && produtoData.categoria.trim() !== '') {
                    const categoriaNome = produtoData.categoria.trim().toLowerCase()
                    const categoriaIdFound = categoriaMap.get(categoriaNome)
                    if (categoriaIdFound) {
                        categoriaId = categoriaIdFound
                    } else {
                        results.errors.push(
                            `Linha ${i + 2}: "${produtoData.nome}" - Categoria "${produtoData.categoria}" não encontrada`
                        )
                        // Continua sem categoria se não encontrar
                    }
                }

                // Cria o produto
                await prisma.produtoServico.create({
                    data: {
                        nome: produtoData.nome.trim(),
                        valor: valorEmCentavos,
                        tipo: produtoData.tipo,
                        tipo_valor: produtoData.tipo_valor,
                        categoria_id: categoriaId,
                        area_trabalho_id: parseInt(workspaceId)
                    }
                })

                results.success++
            } catch (error: any) {
                console.error(`Erro ao importar produto linha ${i + 2}:`, error)
                results.errors.push(
                    `Linha ${i + 2}: ${produtoData.nome} - ${error.message || 'Erro desconhecido'}`
                )
            }
        }

        return NextResponse.json(results, { status: 200 })
    } catch (error) {
        console.error('Failed to import products:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor ao importar produtos' },
            { status: 500 }
        )
    }
}

