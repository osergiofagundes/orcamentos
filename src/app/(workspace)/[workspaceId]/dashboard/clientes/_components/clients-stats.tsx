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
    pessoasFisicas: 0,
    pessoasJuridicas: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClientes}</div>
          <p className="text-xs text-muted-foreground">
            Clientes cadastrados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Esta Semana</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.clientesUltimaSemana}</div>
          <p className="text-xs text-muted-foreground">
            Nos últimos 7 dias
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pessoas Físicas</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pessoasFisicas}</div>
          <p className="text-xs text-muted-foreground">
            CPF cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pessoas Jurídicas</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pessoasJuridicas}</div>
          <p className="text-xs text-muted-foreground">
            CNPJ cadastrados
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
