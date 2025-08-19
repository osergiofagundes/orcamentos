import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { z } from "zod"

const createProductSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  valor: z.number().int().positive("Valor deve ser positivo"),
  tipo_valor: z.enum(["UNIDADE", "METRO", "PESO"], {
    required_error: "Tipo de valor é obrigatório",
  }),
  categoria_id: z.number().int().positive("Categoria é obrigatória"),
})

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params

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

    const produtos = await prisma.produtoServico.findMany({
      where: {
        area_trabalho_id: parseInt(workspaceId),
        deletedAt: null,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(produtos)
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await context.params
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
    const validatedData = createProductSchema.parse(body)

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

    const produto = await prisma.produtoServico.create({
      data: {
        nome: validatedData.nome,
        descricao: validatedData.descricao,
        valor: validatedData.valor,
        tipo_valor: validatedData.tipo_valor,
        categoria_id: validatedData.categoria_id,
        area_trabalho_id: parseInt(workspaceId),
      },
      include: {
        categoria: true,
      },
    })

    return NextResponse.json(produto, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Erro ao criar produto:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
