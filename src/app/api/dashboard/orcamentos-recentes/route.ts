import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o workspace do usuário
    const userWorkspace = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        areaTrabalho: true
      }
    })

    if (!userWorkspace) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 404 })
    }

    const workspaceId = userWorkspace.area_trabalho_id

    // Buscar os 10 orçamentos mais recentes
    const orcamentosRecentes = await prisma.orcamento.findMany({
      where: {
        area_trabalho_id: workspaceId,
        deletedAt: null
      },
      select: {
        id: true,
        data_criacao: true,
        valor_total: true,
        status: true,
        cliente_nome: true, // Usar dados desnormalizados
        cliente: {
          select: {
            nome: true
          }
        },
        usuario: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        data_criacao: 'desc'
      },
      take: 10
    })

    const orcamentosFormatados = orcamentosRecentes.map(orcamento => ({
      id: orcamento.id,
      cliente: orcamento.cliente?.nome || orcamento.cliente_nome, // Usar dados desnormalizados se cliente foi excluído
      valor: orcamento.valor_total ? (orcamento.valor_total / 100) : 0,
      status: orcamento.status,
      data: orcamento.data_criacao.toLocaleDateString('pt-BR'),
      usuario: orcamento.usuario.name
    }))

    return NextResponse.json(orcamentosFormatados)
  } catch (error) {
    console.error('Erro ao buscar orçamentos recentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
