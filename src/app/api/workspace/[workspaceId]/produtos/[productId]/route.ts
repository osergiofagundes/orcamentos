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
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

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
      include: {
        itensOrcamento: true,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ message: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o produto está sendo usado em algum orçamento
    if (existingProduct.itensOrcamento.length > 0 && !force) {
      return NextResponse.json(
        { 
          message: `Não é possível excluir este produto/serviço. Ele está sendo usado em ${existingProduct.itensOrcamento.length} orçamento(s).`,
          details: "Para excluir este produto, primeiro remova-o de todos os orçamentos que o utilizam."
        },
        { status: 400 }
      )
    }

    // Se force = true, excluir primeiro todos os itens de orçamento relacionados
    if (force && existingProduct.itensOrcamento.length > 0) {
      await prisma.itemOrcamento.deleteMany({
        where: {
          produto_servico_id: parseInt(productId),
        },
      })
    }

    await prisma.produtoServico.delete({
      where: {
        id: parseInt(productId),
      },
    })

    const message = force && existingProduct.itensOrcamento.length > 0
      ? `Produto excluído com sucesso. ${existingProduct.itensOrcamento.length} item(s) de orçamento foram removidos.`
      : "Produto excluído com sucesso"

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Erro ao excluir produto:", error)
    
    // Verificar se é um erro de constraint de chave estrangeira
    if (error instanceof Error && error.message.includes('foreign key constraint')) {
      return NextResponse.json(
        { 
          message: "Não é possível excluir este produto/serviço pois ele está sendo usado em orçamentos.",
          details: "Para excluir este produto, primeiro remova-o de todos os orçamentos que o utilizam."
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
