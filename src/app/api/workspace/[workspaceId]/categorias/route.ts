import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { z } from "zod"

const createCategorySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
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

    const categorias = await prisma.categoria.findMany({
      where: {
        area_trabalho_id: parseInt(workspaceId),
      },
      include: {
        _count: {
          select: {
            produtosServicos: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
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

    // Verificar se o usuário tem acesso ao workspace e permissão para criar categorias (nível 2+)
    const userAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!userAccess) {
      return NextResponse.json({ message: "Workspace não encontrado" }, { status: 404 })
    }

    // Verificar se usuário tem permissão para criar categorias (nível 2 ou superior)
    if (userAccess.nivel_permissao < 2) {
      return NextResponse.json({ 
        message: "Você não tem permissão para criar categorias. Necessário nível de acesso 2 ou superior." 
      }, { status: 403 })
    }

    // Validar dados
    const validatedData = createCategorySchema.parse(body)

    // Verificar se já existe uma categoria com o mesmo nome neste workspace
    const existingCategory = await prisma.categoria.findFirst({
      where: {
        nome: validatedData.nome,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (existingCategory) {
      return NextResponse.json({ message: "Já existe uma categoria com este nome" }, { status: 400 })
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: validatedData.nome,
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

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos", errors: error.errors },
        { status: 400 }
      )
    }

    console.error("Erro ao criar categoria:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
