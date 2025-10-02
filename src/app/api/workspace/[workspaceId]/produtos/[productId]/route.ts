import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { z } from "zod"

const updateProductSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valor: z.number().int().positive("Valor deve ser positivo"),
  tipo: z.enum(["PRODUTO", "SERVICO"], {
    required_error: "Tipo é obrigatório",
  }),
  tipo_valor: z.enum(["UNIDADE", "METRO", "METRO_QUADRADO", "METRO_CUBICO", "CENTIMETRO", "DUZIA", "QUILO", "GRAMA", "QUILOMETRO", "LITRO", "MINUTO", "HORA", "DIA", "MES", "ANO"], {
    required_error: "Tipo de valor é obrigatório",
  }),
  categoria_id: z.number().int().min(0, "Categoria deve ser um número válido"),
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; productId: string }> }
) {
  try {
    const { workspaceId, productId } = await context.params
    const body = await request.json()

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem acesso ao workspace e permissão para editar produtos (nível 2+)
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
    }

    // Verificar se usuário tem permissão para editar produtos (nível 2 ou superior)
    if (userAccess.nivel_permissao < 2) {
      return NextResponse.json({ 
        message: "Você não tem permissão para editar produtos e serviços. Necessário nível de acesso 2 ou superior." 
      }, { status: 403 })
    }

    // Validar dados
    const validatedData = updateProductSchema.parse(body)

    // Verificar se o produto existe e pertence ao workspace
    const existingProduct = await prisma.produtoServico.findFirst({
      where: {
        id: parseInt(productId),
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se a categoria existe e pertence ao workspace
    // Verificar se a categoria existe e pertence ao workspace (só se categoria_id não for 0)
    if (validatedData.categoria_id > 0) {
      const categoria = await prisma.categoria.findFirst({
        where: {
          id: validatedData.categoria_id,
          area_trabalho_id: parseInt(workspaceId),
        },
      })

      if (!categoria) {
        return NextResponse.json({ message: "Categoria não encontrada" }, { status: 404 })
      }
    }

    const produto = await prisma.produtoServico.update({
      where: {
        id: parseInt(productId),
      },
      data: {
        nome: validatedData.nome,
        valor: validatedData.valor,
        tipo: validatedData.tipo,
        tipo_valor: validatedData.tipo_valor,
        categoria_id: validatedData.categoria_id === 0 ? null : validatedData.categoria_id,
      },
      include: {
        categoria: true,
      },
    })

    return NextResponse.json(produto)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; productId: string }> }
) {
  try {
    const { workspaceId, productId } = await context.params

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem acesso ao workspace e permissão para excluir produtos (nível 2+)
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
    }

    // Verificar se usuário tem permissão para excluir produtos (nível 2 ou superior)
    if (userAccess.nivel_permissao < 2) {
      return NextResponse.json({ 
        message: "Você não tem permissão para excluir produtos e serviços. Necessário nível de acesso 2 ou superior." 
      }, { status: 403 })
    }

    // Verificar se o produto existe e pertence ao workspace
    const existingProduct = await prisma.produtoServico.findFirst({
      where: {
        id: parseInt(productId),
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    // Realizar soft delete (mover para lixeira)
    await prisma.produtoServico.update({
      where: {
        id: parseInt(productId),
      },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id
      }
    })

    // Com dados desnormalizados, os orçamentos mantém os dados do produto
    return NextResponse.json({ message: "Produto movido para a lixeira com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
