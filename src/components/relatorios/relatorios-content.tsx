'use client'

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Package,
  TrendingUp,
  Download 
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface ResumoOrcamentos {
  total: number
  aprovados: number
  rejeitados: number
  pendentes: number
}

interface OrcamentoPorCliente {
  clienteId: number | null
  clienteNome: string
  quantidadeOrcamentos: number
  valorTotal: number
}

interface ProdutoMaisOrcado {
  produtoId: number | null
  produtoNome: string
  vezesOrcado: number
  quantidadeTotal: number
}

interface RelatoriosData {
  resumoOrcamentos: ResumoOrcamentos
  orcamentosPorCliente: OrcamentoPorCliente[]
  produtosMaisOrcados: ProdutoMaisOrcado[]
}

interface RelatoriosContentProps {
  workspaceId: string
}

export function RelatoriosContent({ workspaceId }: RelatoriosContentProps) {
  const [data, setData] = useState<RelatoriosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatorios() {
      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/relatorios?workspaceId=${workspaceId}`)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar relatórios')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchRelatorios()
  }, [workspaceId])

  const formatCurrency = (valueInCents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInCents / 100)
  }

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Análises e métricas detalhadas dos seus orçamentos
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3 p-6 border rounded-xl">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar relatórios: {error}</p>
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-6">
          {/* 1. RESUMO DE ORÇAMENTOS */}
          <div>
            <h2 className="text-lg font-semibold mb-4 px-2">Resumo de Orçamentos</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.resumoOrcamentos.total}</div>
                  <p className="text-xs text-muted-foreground">Todos os orçamentos criados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.resumoOrcamentos.aprovados}
                  </div>
                  <p className="text-xs text-muted-foreground">Orçamentos aprovados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.resumoOrcamentos.rejeitados}
                  </div>
                  <p className="text-xs text-muted-foreground">Orçamentos rejeitados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.resumoOrcamentos.pendentes}
                  </div>
                  <p className="text-xs text-muted-foreground">Aguardando resposta</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 2. ORÇAMENTOS POR CLIENTE */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>Orçamentos por Cliente</CardTitle>
                  </div>
                  <CardDescription>
                    Top 10 clientes com mais orçamentos criados
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="hover:border-sky-600 cursor-pointer hover:text-sky-600">
                  Exportar CSV
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.orcamentosPorCliente.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum orçamento com cliente encontrado
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orcamentosPorCliente.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.clienteNome}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantidadeOrcamentos}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* 3. PRODUTOS/SERVIÇOS MAIS ORÇADOS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>Produtos/Serviços Mais Orçados</CardTitle>
                  </div>
                  <CardDescription>
                    Top 10 itens mais frequentes nos orçamentos
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="hover:border-sky-600 cursor-pointer hover:text-sky-600">
                  Exportar CSV
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {data.produtosMaisOrcados.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum produto/serviço encontrado nos orçamentos
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto/Serviço</TableHead>
                      <TableHead className="text-center">Vezes Orçado</TableHead>
                      <TableHead className="text-right">Quantidade Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.produtosMaisOrcados.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.produtoNome}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.vezesOrcado}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.quantidadeTotal}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  )
}
