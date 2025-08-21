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
                { error: "Sem permissão para rejeitar solicitações" },
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
            }
        })

        if (!solicitacao) {
            return NextResponse.json(
                { error: "Solicitação não encontrada" },
                { status: 404 }
            )
        }

        // Atualizar status da solicitação para rejeitado
        await prisma.solicitacaoEntrada.update({
            where: { id: parseInt(requestId) },
            data: {
                status: 'REJEITADO',
                respondido_por: session.user.id,
                respondido_em: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Erro ao rejeitar solicitação:', error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
