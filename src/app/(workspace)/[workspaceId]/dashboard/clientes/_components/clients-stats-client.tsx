"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Building, User } from "lucide-react"

interface ClientsStatsProps {
  workspaceId: string
}

export function ClientsStats({ workspaceId }: ClientsStatsProps) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesUltimaSemana: 0,
    clientesPF: 0,
    clientesPJ: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/clientes`)

        if (response.ok) {
          const clients = await response.json()

          // Calcular estatísticas
          const totalClientes = clients.length

          // Clientes da última semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const clientesUltimaSemana = clients.filter((client: any) => 
            new Date(client.createdAt) >= oneWeekAgo
          ).length

          // Separar por tipo de pessoa
          const clientesPF = clients.filter((client: any) => client.tipo_pessoa === "PF").length
          const clientesPJ = clients.filter((client: any) => client.tipo_pessoa === "PJ").length

          setStats({
            totalClientes,
            clientesUltimaSemana,
            clientesPF,
            clientesPJ,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [workspaceId])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-l-4 border-l-muted">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-16 mb-1" />
              <div className="h-3 bg-muted animate-pulse rounded w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: "Total de Clientes",
      value: stats.totalClientes.toString(),
      icon: Users,
      description: "Clientes cadastrados",
    },
    {
      title: "Novos esta semana",
      value: stats.clientesUltimaSemana.toString(),
      icon: TrendingUp,
      description: "Últimos 7 dias",
    },
    {
      title: "Pessoa Física",
      value: stats.clientesPF.toString(),
      icon: User,
      description: "Clientes PF",
    },
    {
      title: "Pessoa Jurídica",
      value: stats.clientesPJ.toString(),
      icon: Building,
      description: "Clientes PJ",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
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
}
