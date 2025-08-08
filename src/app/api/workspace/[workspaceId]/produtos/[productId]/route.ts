import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { z } from "zod"

const updateProductSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  valor: z.number().int().positive("Valor deve ser positivo"),
  categoria_id: z.number().int().positive("Categoria é obrigatória"),
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

    // Verificar se o usuário tem acesso ao workspace
    const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!hasAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
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
    const categoria = await prisma.categoria.findFirst({
      where: {
        id: validatedData.categoria_id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!categoria) {
      return NextResponse.json({ message: "Categoria não encontrada" }, { status: 404 })
    }

    const produto = await prisma.produtoServico.update({
      where: {
        id: parseInt(productId),
      },
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao,
        valor: validatedData.valor,
        categoria_id: validatedData.categoria_id,
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

    // Verificar se o usuário tem acesso ao workspace
    const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!hasAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
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

    await prisma.produtoServico.delete({
      where: {
        id: parseInt(productId),
      },
    })

    return NextResponse.json({ message: "Produto excluído com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
