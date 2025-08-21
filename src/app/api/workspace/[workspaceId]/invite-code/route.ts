import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// Função para gerar código aleatório
function generateInviteCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'
    let result = ''
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function POST(
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
                { error: "Sem permissão para gerenciar usuários" },
                { status: 403 }
            )
        }

        const { nivel_permissao } = await request.json()

        // Desativar códigos de convite anteriores do mesmo usuário
        await prisma.conviteWorkspace.updateMany({
            where: {
                area_trabalho_id: parseInt(workspaceId),
                criado_por: session.user.id,
                status: 'ATIVO'
            },
            data: {
                status: 'EXPIRADO'
            }
        })

        // Gerar novo código de convite
        const codigo = generateInviteCode()
        const expiraEm = new Date()
        expiraEm.setDate(expiraEm.getDate() + 7) // Expira em 7 dias

        const convite = await prisma.conviteWorkspace.create({
            data: {
                codigo,
                area_trabalho_id: parseInt(workspaceId),
                criado_por: session.user.id,
                nivel_permissao: nivel_permissao || 1,
                expira_em: expiraEm
            }
        })

        return NextResponse.json({
            id: convite.id,
            codigo: convite.codigo,
            expira_em: convite.expira_em
        })

    } catch (error) {
        console.error('Erro ao gerar código de convite:', error)
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        )
    }
}
