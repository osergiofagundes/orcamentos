"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Building, User, ChevronDown, ChevronUp } from "lucide-react"

interface ClientsStatsProps {
  workspaceId: string
}

export function ClientsStats({ workspaceId }: ClientsStatsProps) {
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesUltimaSemana: 0,
    pessoasFisicas: 0,
    pessoasJuridicas: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/clientes`)

        if (response.ok) {
          const clientes = await response.json()

          // Calcular estatísticas
          const totalClientes = clientes.length

          // Clientes da última semana
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

          const clientesUltimaSemana = clientes.filter((cliente: any) => 
            new Date(cliente.createdAt) >= oneWeekAgo
          ).length

          // Contar tipos de pessoa
          const pessoasFisicas = clientes.filter((cliente: any) => {
            const cpfCnpj = cliente.cpf_cnpj.replace(/\D/g, '')
            return cpfCnpj.length === 11
          }).length

          const pessoasJuridicas = clientes.filter((cliente: any) => {
            const cpfCnpj = cliente.cpf_cnpj.replace(/\D/g, '')
            return cpfCnpj.length === 14
          }).length

          setStats({
            totalClientes,
            clientesUltimaSemana,
            pessoasFisicas,
            pessoasJuridicas,
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

  const statsCards = [
    {
      title: "Total de Clientes",
      value: stats.totalClientes.toString(),
      icon: Users,
      description: "Clientes cadastrados",
    },
    {
      title: "Novos Esta Semana",
      value: stats.clientesUltimaSemana.toString(),
      icon: TrendingUp,
      description: "Nos últimos 7 dias",
    },
    {
      title: "Pessoas Físicas",
      value: stats.pessoasFisicas.toString(),
      icon: User,
      description: "CPF cadastrados",
    },
    {
      title: "Pessoas Jurídicas",
      value: stats.pessoasJuridicas.toString(),
      icon: Building,
      description: "CNPJ cadastrados",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Para mobile, mostra apenas o primeiro card se showAll for false
  const cardsToShow = showAll ? statsCards : statsCards.slice(0, 1)

  return (
    <div className="space-y-4">
      {/* Grid dos cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Desktop: mostra todos os cards */}
        <div className="hidden md:contents">
          {statsCards.map((card, index) => (
            <Card key={index} className="border-l-8 border-l-sky-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile: mostra cards baseado no estado showAll */}
        <div className="md:hidden space-y-4">
          {cardsToShow.map((card, index) => (
            <Card key={index} className="border-l-8 border-l-sky-600">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Botão "Mostrar mais" apenas no mobile */}
      <div className="md:hidden flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2"
        >
          {showAll ? (
            <>
              Mostrar menos
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Mostrar mais
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
