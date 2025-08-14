"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, FileText, Calendar, DollarSign, User, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { EditOrcamentoModal } from "./edit-orcamento-modal"
import { DeleteOrcamentoModal } from "./delete-orcamento-modal"

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
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedOrcamentoId, setSelectedOrcamentoId] = useState<number | null>(null)
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null)
  const router = useRouter()

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

  const handleEditOrcamento = (orcamentoId: number) => {
    setSelectedOrcamentoId(orcamentoId)
    setEditModalOpen(true)
  }

  const handleDeleteOrcamento = (orcamento: Orcamento) => {
    setSelectedOrcamento(orcamento)
    setDeleteModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
    setSelectedOrcamentoId(null)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedOrcamento(null)
  }

  const handleOrcamentoUpdated = () => {
    loadOrcamentos() // Recarregar a lista
  }

  const handleOrcamentoDeleted = () => {
    loadOrcamentos() // Recarregar a lista
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100) // Convert from cents
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
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
      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orcamentos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground bg-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orcamentos.filter(o => o.status === "APROVADO").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground bg-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orcamentos.filter(o => o.status === "ENVIADO").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                orcamentos
                  .filter(o => o.status === "APROVADO")
                  .reduce((sum, o) => sum + (o.valor_total || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamentos.map((orcamento) => (
                <TableRow key={orcamento.id}>
                  <TableCell className="font-medium">#{orcamento.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{orcamento.cliente.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {orcamento.cliente.cpf_cnpj}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(orcamento.data_criacao)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(orcamento.valor_total)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={statusColors[orcamento.status as keyof typeof statusColors]}
                    >
                      {statusLabels[orcamento.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {orcamento.usuario.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => router.push(`/${workspaceId}/dashboard/orcamentos/${orcamento.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      {(orcamento.status === "RASCUNHO" || orcamento.status === "ENVIADO") && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditOrcamento(orcamento.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteOrcamento(orcamento)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {selectedOrcamentoId && selectedOrcamentoId > 0 && (
        <EditOrcamentoModal
          orcamentoId={selectedOrcamentoId}
          workspaceId={workspaceId}
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onOrcamentoUpdated={handleOrcamentoUpdated}
        />
      )}

      {/* Modal de Exclusão */}
      {selectedOrcamento && (
        <DeleteOrcamentoModal
          orcamentoId={selectedOrcamento.id}
          orcamentoNumero={selectedOrcamento.id.toString()}
          clienteNome={selectedOrcamento.cliente.nome}
          valorTotal={selectedOrcamento.valor_total}
          workspaceId={workspaceId}
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onOrcamentoDeleted={handleOrcamentoDeleted}
        />
      )}
    </div>
  )
}
