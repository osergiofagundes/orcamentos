import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const { workspaceId } = await params
        
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        // Verificar se o usuário tem permissão para gerenciar usuários (nível 2+)
        const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: session.user.id,
                area_trabalho_id: parseInt(workspaceId),
                nivel_permissao: { gte: 2 }
            }
        })

        if (!userAccess) {
            return NextResponse.json(
                { error: "Sem permissão para visualizar solicitações" },
                { status: 403 }
            )
        }

        // Buscar solicitações pendentes
        const solicitacoes = await prisma.solicitacaoEntrada.findMany({
            where: {
                convite: {
                    area_trabalho_id: parseInt(workspaceId)
                },
                status: 'PENDENTE'
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                convite: {
                    select: {
                        nivel_permissao: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(solicitacoes)

    } catch (error) {
        console.error('Erro ao buscar solicitações:', error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
