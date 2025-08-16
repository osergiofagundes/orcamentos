"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, DollarSign, User, Building } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { OrcamentoActions } from "./orcamento-actions"

interface Orcamento {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  cliente: {
    nome: string
    cpf_cnpj: string
  }
  usuario: {
    name: string
  }
  itensOrcamento: {
    id: number
    quantidade: number
    preco_unitario: number
    produtoServico: {
      nome: string
    }
  }[]
}

interface OrcamentosListProps {
  workspaceId: string
  refreshTrigger: number
}

const statusColors = {
  RASCUNHO: "bg-gray-100 text-gray-800",
  ENVIADO: "bg-blue-100 text-blue-800",
  APROVADO: "bg-green-100 text-green-800",
  REJEITADO: "bg-red-100 text-red-800",
  CANCELADO: "bg-orange-100 text-orange-800",
}

const statusLabels = {
  RASCUNHO: "Rascunho",
  ENVIADO: "Enviado",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  CANCELADO: "Cancelado",
}

export function OrcamentosList({ workspaceId, refreshTrigger }: OrcamentosListProps) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  useEffect(() => {
    loadOrcamentos()
  }, [workspaceId, refreshTrigger])

  const loadOrcamentos = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos`)
      if (response.ok) {
        const data = await response.json()
        setOrcamentos(data)
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100) // Convert from cents
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  const formatCpfCnpj = (cpfCnpj: string) => {
    const numbersOnly = cpfCnpj.replace(/\D/g, '')

    if (numbersOnly.length === 11) {
      // CPF
      return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbersOnly.length === 14) {
      // CNPJ
      return cpfCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return cpfCnpj
  }

  const updateOrcamentoStatus = async (orcamentoId: number, newStatus: string) => {
    setUpdatingStatus(orcamentoId)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos/${orcamentoId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the local state
        setOrcamentos(prev =>
          prev.map(orcamento =>
            orcamento.id === orcamentoId
              ? { ...orcamento, status: newStatus }
              : orcamento
          )
        )
      } else {
        console.error("Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (orcamentos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
          <p className="text-muted-foreground">
            Comece criando seu primeiro orçamento clicando no botão "Novo Orçamento".
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabela de orçamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentos.map((orcamento) => (
                <TableRow key={orcamento.id}>
                  <TableCell>#{orcamento.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {orcamento.cliente.cpf_cnpj.replace(/\D/g, '').length === 11 ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>
                        {orcamento.cliente.nome} - {formatCpfCnpj(orcamento.cliente.cpf_cnpj)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {formatCurrency(orcamento.valor_total)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={orcamento.status}
                      onValueChange={(value) => updateOrcamentoStatus(orcamento.id, value)}
                      disabled={updatingStatus === orcamento.id}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[orcamento.status as keyof typeof statusColors]}`}>
                            {statusLabels[orcamento.status as keyof typeof statusLabels]}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RASCUNHO">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors.RASCUNHO}`}>
                            {statusLabels.RASCUNHO}
                          </div>
                        </SelectItem>
                        <SelectItem value="ENVIADO">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors.ENVIADO}`}>
                            {statusLabels.ENVIADO}
                          </div>
                        </SelectItem>
                        <SelectItem value="APROVADO">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors.APROVADO}`}>
                            {statusLabels.APROVADO}
                          </div>
                        </SelectItem>
                        <SelectItem value="REJEITADO">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors.REJEITADO}`}>
                            {statusLabels.REJEITADO}
                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELADO">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors.CANCELADO}`}>
                            {statusLabels.CANCELADO}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {orcamento.usuario.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(orcamento.data_criacao)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <OrcamentoActions
                      orcamento={orcamento}
                      workspaceId={workspaceId}
                      onUpdate={loadOrcamentos}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
