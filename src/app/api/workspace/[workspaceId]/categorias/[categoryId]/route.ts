import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { z } from "zod"

const updateCategorySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
})

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; categoryId: string }> }
) {
  try {
    const { workspaceId, categoryId } = await context.params
    const body = await request.json()

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem acesso ao workspace e permissão para editar categorias (nível 2+)
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
    }

    // Verificar se usuário tem permissão para editar categorias (nível 2 ou superior)
    if (userAccess.nivel_permissao < 2) {
      return NextResponse.json({ 
        message: "Você não tem permissão para editar categorias. Necessário nível de acesso 2 ou superior." 
      }, { status: 403 })
    }

    // Validar dados
    const validatedData = updateCategorySchema.parse(body)

    // Verificar se a categoria existe e pertence ao workspace
    const existingCategory = await prisma.categoria.findFirst({
      where: {
        id: parseInt(categoryId),
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ message: "Categoria não encontrada" }, { status: 404 })
    }

    // Verificar se já existe outra categoria com o mesmo nome neste workspace
    const duplicateCategory = await prisma.categoria.findFirst({
      where: {
        nome: validatedData.nome,
        area_trabalho_id: parseInt(workspaceId),
        id: { not: parseInt(categoryId) },
      },
    })

    if (duplicateCategory) {
      return NextResponse.json({ message: "Já existe uma categoria com este nome" }, { status: 400 })
    }

    const categoria = await prisma.categoria.update({
      where: {
        id: parseInt(categoryId),
      },
      data: {
        nome: validatedData.nome,
      },
      include: {
        _count: {
          select: {
            produtosServicos: true,
          },
        },
      },
    })

    return NextResponse.json(categoria)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Erro ao atualizar categoria:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string; categoryId: string }> }
) {
  try {
    const { workspaceId, categoryId } = await context.params

    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 })
    }

    // Verificar se o usuário tem acesso ao workspace e permissão para excluir categorias (nível 2+)
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
    }

    // Verificar se usuário tem permissão para excluir categorias (nível 2 ou superior)
    if (userAccess.nivel_permissao < 2) {
      return NextResponse.json({ 
        message: "Você não tem permissão para excluir categorias. Necessário nível de acesso 2 ou superior." 
      }, { status: 403 })
    }

    // Verificar se a categoria existe e pertence ao workspace
    const existingCategory = await prisma.categoria.findFirst({
      where: {
        id: parseInt(categoryId),
        area_trabalho_id: parseInt(workspaceId),
      },
      include: {
        _count: {
          select: {
            produtosServicos: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ message: "Categoria não encontrada" }, { status: 404 })
    }

    // Verificar se a categoria tem produtos associados
    if (existingCategory._count.produtosServicos > 0) {
      return NextResponse.json(
        { 
          message: `Não é possível excluir a categoria. Ela possui ${existingCategory._count.produtosServicos} produto(s) associado(s).` 
        }, 
        { status: 400 }
      )
    }

    await prisma.categoria.delete({
      where: {
        id: parseInt(categoryId),
      },
    })

    return NextResponse.json({ message: "Categoria excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir categoria:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
