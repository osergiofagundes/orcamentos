import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const { codigo, mensagem } = await request.json()

        if (!codigo || typeof codigo !== 'string') {
            return NextResponse.json(
                { error: "Código de convite é obrigatório" },
                { status: 400 }
            )
        }

        // Buscar o convite pelo código
        const convite = await prisma.conviteWorkspace.findFirst({
            where: {
                codigo: codigo.trim(),
                status: 'ATIVO',
                expira_em: {
                    gte: new Date() // Não expirado
                }
            },
            include: {
                areaTrabalho: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        })

        if (!convite) {
            return NextResponse.json(
                { error: "Código de convite inválido ou expirado" },
                { status: 404 }
            )
        }

        // Verificar se o usuário já faz parte do workspace
        const existingUser = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: convite.area_trabalho_id
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Você já faz parte deste workspace" },
                { status: 400 }
            )
        }

        // Verificar se já existe uma solicitação pendente
        const existingRequest = await prisma.solicitacaoEntrada.findFirst({
            where: {
                convite_id: convite.id,
                usuario_id: session.user.id,
                status: 'PENDENTE'
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { error: "Você já possui uma solicitação pendente para este workspace" },
                { status: 400 }
            )
        }

        // Criar nova solicitação de entrada
        const solicitacao = await prisma.solicitacaoEntrada.create({
            data: {
                convite_id: convite.id,
                usuario_id: session.user.id,
                mensagem: mensagem || null
            }
        })

        return NextResponse.json({
            success: true,
            message: `Solicitação enviada para o workspace "${convite.areaTrabalho.nome}". Aguarde a aprovação do administrador.`,
            workspace: {
                id: convite.areaTrabalho.id,
                nome: convite.areaTrabalho.nome
            }
        })

    } catch (error) {
        console.error('Erro ao processar solicitação de entrada:', error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
