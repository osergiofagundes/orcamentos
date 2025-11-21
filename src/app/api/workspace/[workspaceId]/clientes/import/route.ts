import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// POST /api/workspace/[workspaceId]/clientes/import - Importar clientes em lote
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

        const body = await req.json()
        const { clientes } = body

        if (!Array.isArray(clientes) || clientes.length === 0) {
            return NextResponse.json(
                { error: 'Lista de clientes inválida' },
                { status: 400 }
            )
        }

        const results = {
            success: 0,
            errors: [] as string[],
            total: clientes.length
        }

        // Processa cada cliente
        for (let i = 0; i < clientes.length; i++) {
            const clienteData = clientes[i]

            try {
                // Validação básica
                if (!clienteData.nome || clienteData.nome.trim() === '') {
                    results.errors.push(`Linha ${i + 2}: Nome é obrigatório`)
                    continue
                }

                // Verificar se CPF/CNPJ já existe (apenas se fornecido)
                if (clienteData.cpf_cnpj && clienteData.cpf_cnpj.trim() !== '') {
                    const existingClient = await prisma.cliente.findFirst({
                        where: {
                            cpf_cnpj: clienteData.cpf_cnpj.trim(),
                            area_trabalho_id: parseInt(workspaceId),
                            deletedAt: null
                        }
                    })

                    if (existingClient) {
                        results.errors.push(
                            `Linha ${i + 2}: Cliente "${clienteData.nome}" - CPF/CNPJ já existe`
                        )
                        continue
                    }
                }

                // Cria o cliente
                await prisma.cliente.create({
                    data: {
                        nome: clienteData.nome.trim(),
                        cpf_cnpj: clienteData.cpf_cnpj && clienteData.cpf_cnpj.trim() !== '' 
                            ? clienteData.cpf_cnpj.trim() 
                            : null,
                        telefone: clienteData.telefone && clienteData.telefone.trim() !== '' 
                            ? clienteData.telefone.trim() 
                            : null,
                        email: clienteData.email && clienteData.email.trim() !== '' 
                            ? clienteData.email.trim() 
                            : null,
                        endereco: clienteData.endereco && clienteData.endereco.trim() !== '' 
                            ? clienteData.endereco.trim() 
                            : null,
                        bairro: clienteData.bairro && clienteData.bairro.trim() !== '' 
                            ? clienteData.bairro.trim() 
                            : null,
                        cidade: clienteData.cidade && clienteData.cidade.trim() !== '' 
                            ? clienteData.cidade.trim() 
                            : null,
                        estado: clienteData.estado && clienteData.estado.trim() !== '' 
                            ? clienteData.estado.trim() 
                            : null,
                        cep: clienteData.cep && clienteData.cep.trim() !== '' 
                            ? clienteData.cep.trim() 
                            : null,
                        area_trabalho_id: parseInt(workspaceId)
                    }
                })

                results.success++
            } catch (error: any) {
                console.error(`Erro ao importar cliente linha ${i + 2}:`, error)
                results.errors.push(
                    `Linha ${i + 2}: ${clienteData.nome} - ${error.message || 'Erro desconhecido'}`
                )
            }
        }

        return NextResponse.json(results, { status: 200 })
    } catch (error) {
        console.error('Failed to import clients:', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor ao importar clientes' },
            { status: 500 }
        )
    }
}

