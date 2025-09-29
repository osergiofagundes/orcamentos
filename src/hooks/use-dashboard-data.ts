'use client'

import { useState, useEffect } from 'react'

export interface DashboardStats {
  totalClientes: number
  totalProdutos: number
  totalOrcamentos: number
  orcamentosAprovados: number
  orcamentosPendentes: number
  valorTotalAprovados: number
  taxaAprovacao: string
}

export interface DashboardCharts {
  orcamentosPorStatus: Array<{
    status: string
    quantidade: number
  }>
  orcamentosPorMes: Array<{
    mes: string
    quantidade: number
    valor: number
  }>
  topProdutos: Array<{
    produto_servico_id: number
    nome: string
    tipo: string
    _sum: {
      quantidade: number | null
    }
    _count: {
      id: number
    }
  }>
  produtosVsServicos: Array<{
    tipo: string
    quantidade: number
  }>
}

export interface RecentClient {
  id: number
  nome: string
  email: string
  telefone: string | null
  data_criacao: string
  cpf_cnpj: string
}

export interface RecentProduct {
  id: number
  nome: string
  tipo: 'PRODUTO' | 'SERVICO'
  valor: number
  data_criacao: string
}

export interface RecentOrcamento {
  id: number
  cliente_nome: string
  valor_total: number
  status: string
  data_criacao: string
  responsavel: string
}

export interface DashboardData {
  stats: DashboardStats
  charts: DashboardCharts
  recentClients: RecentClient[]
  recentProducts: RecentProduct[]
  recentOrcamentos: RecentOrcamento[]
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/stats')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do dashboard')
        }

        const data = await response.json()
        setData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { data, loading, error }
}
