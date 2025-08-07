import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Building, User } from "lucide-react"

interface ClientsStatsProps {
  workspaceId: string
}

export async function ClientsStats({ workspaceId }: ClientsStatsProps) {
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

    // Total de clientes
    const totalClientes = await prisma.cliente.count({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
      },
    })

    // Clientes da última semana
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const clientesUltimaSemana = await prisma.cliente.count({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    // Buscar todos os clientes para classificar
    const allClientes = await prisma.cliente.findMany({
      where: {
        area_trabalho_id: workspaceIdInt,
        deletedAt: null,
      },
      select: {
        cpf_cnpj: true,
      },
    })

    // Classificar clientes PF vs PJ
    let clientesPF = 0
    let clientesPJ = 0

    allClientes.forEach((cliente) => {
      // Remove caracteres especiais para contar apenas números
      const numbersOnly = cliente.cpf_cnpj.replace(/\D/g, '')
      
      if (numbersOnly.length === 11) {
        clientesPF++
      } else if (numbersOnly.length === 14) {
        clientesPJ++
      }
    })

    const stats = [
      {
        title: "Total de Clientes",
        value: totalClientes.toString(),
        icon: Users,
        description: "Clientes cadastrados",
      },
      {
        title: "Novos esta semana",
        value: clientesUltimaSemana.toString(),
        icon: TrendingUp,
        description: "Últimos 7 dias",
      },
      {
        title: "Pessoa Física",
        value: clientesPF.toString(),
        icon: User,
        description: "Clientes PF",
      },
      {
        title: "Pessoa Jurídica",
        value: clientesPJ.toString(),
        icon: Building,
        description: "Clientes PJ",
      },
    ]

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch client stats:", error)
    return null
  }
}
