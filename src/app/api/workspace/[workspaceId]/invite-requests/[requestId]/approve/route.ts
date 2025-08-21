import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ workspaceId: string; requestId: string }> }
) {
    try {
        const { workspaceId, requestId } = await params
        
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
                { error: "Sem permissão para aprovar solicitações" },
                { status: 403 }
            )
        }

        // Buscar a solicitação
        const solicitacao = await prisma.solicitacaoEntrada.findFirst({
            where: {
                id: parseInt(requestId),
                convite: {
                    area_trabalho_id: parseInt(workspaceId)
                },
                status: 'PENDENTE'
            },
            include: {
                convite: true
            }
        })

        if (!solicitacao) {
            return NextResponse.json(
                { error: "Solicitação não encontrada" },
                { status: 404 }
            )
        }

        // Verificar se o usuário já faz parte do workspace
        const existingUser = await prisma.usuarioAreaTrabalho.findFirst({
            where: {
                usuario_id: solicitacao.usuario_id,
                area_trabalho_id: parseInt(workspaceId)
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Usuário já faz parte do workspace" },
                { status: 400 }
            )
        }

        // Usar transação para aprovar a solicitação e adicionar o usuário
        await prisma.$transaction(async (tx) => {
            // Atualizar status da solicitação
            await tx.solicitacaoEntrada.update({
                where: { id: parseInt(requestId) },
                data: {
                    status: 'APROVADO',
                    respondido_por: session.user!.id,
                    respondido_em: new Date()
                }
            })

            // Adicionar usuário ao workspace
            await tx.usuarioAreaTrabalho.create({
                data: {
                    usuario_id: solicitacao.usuario_id,
                    area_trabalho_id: parseInt(workspaceId),
                    nivel_permissao: solicitacao.convite.nivel_permissao
                }
            })
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Erro ao aprovar solicitação:', error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
