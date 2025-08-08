import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, DollarSign, Tag } from "lucide-react"

interface ProductsStatsProps {
  workspaceId: string
}

export async function ProductsStats({ workspaceId }: ProductsStatsProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return null
  }

  try {
    // Verificar acesso ao workspace
    const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!hasAccess) {
      return null
    }

    const workspaceIdInt = parseInt(workspaceId)

    // Total de produtos/serviços
    const totalProdutos = await prisma.produtoServico.count({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
      },
    })

    // Produtos/serviços da última semana
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const produtosUltimaSemana = await prisma.produtoServico.count({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    // Valor médio dos produtos/serviços
    const produtosComValor = await prisma.produtoServico.findMany({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
        valor: { not: null },
      },
      select: {
        valor: true,
      },
    })

    const valorMedio = produtosComValor.length > 0 
      ? produtosComValor.reduce((sum, p) => sum + (p.valor || 0), 0) / produtosComValor.length 
      : 0

    // Total de categorias
    const totalCategorias = await prisma.categoria.count({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
      },
    })

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value / 100)
    }

    const stats = [
      {
        title: "Total de Produtos/Serviços",
        value: totalProdutos.toString(),
        icon: Package,
        description: "Itens cadastrados",
      },
      {
        title: "Novos esta semana",
        value: produtosUltimaSemana.toString(),
        icon: TrendingUp,
        description: "Últimos 7 dias",
      },
      {
        title: "Valor Médio",
        value: formatCurrency(valorMedio),
        icon: DollarSign,
        description: "Por produto/serviço",
      },
      {
        title: "Categorias",
        value: totalCategorias.toString(),
        icon: Tag,
        description: "Categorias ativas",
      },
    ]

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const colors = [
            { border: "border-l-blue-500", bg: "bg-blue-100", dot: "bg-blue-500", text: "text-blue-600" },
            { border: "border-l-green-500", bg: "bg-green-100", dot: "bg-green-500", text: "text-green-600" },
            { border: "border-l-purple-500", bg: "bg-purple-100", dot: "bg-purple-500", text: "text-purple-600" },
            { border: "border-l-orange-500", bg: "bg-orange-100", dot: "bg-orange-500", text: "text-orange-600" },
          ]
          const color = colors[index % colors.length]
          
          return (
            <Card key={stat.title} className={`${color.border} border-l-4`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg ${color.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${color.dot.replace('bg-', 'text-')}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${index === 0 ? '' : color.text}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch product stats:", error)
    return null
  }
}
