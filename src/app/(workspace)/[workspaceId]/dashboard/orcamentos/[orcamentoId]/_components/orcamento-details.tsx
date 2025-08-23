"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Calendar, 
  DollarSign, 
  User, 
  FileText, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { EditOrcamentoModal } from "../../_components/edit-orcamento-modal"
import { DeleteOrcamentoModal } from "../../_components/delete-orcamento-modal"

interface OrcamentoDetalhado {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  observacoes?: string
  cliente: {
    nome: string
    cpf_cnpj: string
    email?: string
    telefone?: string
    endereco?: string
  }
  usuario: {
    name: string
    email?: string
  }
  itensOrcamento: {
    id: number
    quantidade: number
    preco_unitario: number
    desconto_percentual: number | null
    desconto_valor: number | null
    produtoServico: {
      nome: string
      descricao?: string
    }
  }[]
}

interface OrcamentoDetailsProps {
  workspaceId: string
  orcamentoId: string
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

export function OrcamentoDetails({ workspaceId, orcamentoId }: OrcamentoDetailsProps) {
  const [orcamento, setOrcamento] = useState<OrcamentoDetalhado | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadOrcamento()
  }, [workspaceId, orcamentoId])

  const loadOrcamento = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos/${orcamentoId}`)
      if (response.ok) {
        const data = await response.json()
        setOrcamento(data)
      } else if (response.status === 404) {
        setError("Orçamento não encontrado")
      } else {
        setError("Erro ao carregar orçamento")
      }
    } catch (error) {
      console.error("Erro ao carregar orçamento:", error)
      setError("Erro ao carregar orçamento")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const calculateSubtotal = (quantidade: number, precoUnitario: number) => {
    return quantidade * precoUnitario
  }

  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantidade * item.preco_unitario
    let desconto = 0
    
    if (item.desconto_percentual && item.desconto_percentual > 0) {
      desconto = subtotal * (parseFloat(item.desconto_percentual.toString()) / 100)
    } else if (item.desconto_valor && item.desconto_valor > 0) {
      desconto = item.desconto_valor
    }
    
    return Math.max(0, subtotal - desconto)
  }

  const getDescontoInfo = (item: any) => {
    if (item.desconto_percentual && item.desconto_percentual > 0) {
      return {
        tipo: "percentual",
        valor: parseFloat(item.desconto_percentual.toString()),
        desconto: item.quantidade * item.preco_unitario * (parseFloat(item.desconto_percentual.toString()) / 100)
      }
    } else if (item.desconto_valor && item.desconto_valor > 0) {
      return {
        tipo: "valor",
        valor: item.desconto_valor,
        desconto: item.desconto_valor
      }
    }
    return null
  }

  const handleEditOrcamento = () => {
    setEditModalOpen(true)
  }

  const handleDeleteOrcamento = () => {
    setDeleteModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setEditModalOpen(false)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
  }

  const handleOrcamentoUpdated = () => {
    loadOrcamento() // Recarregar os dados
  }

  const handleOrcamentoDeleted = () => {
    router.push(`/${workspaceId}/dashboard/orcamentos`) // Voltar para a lista
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !orcamento) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{error || "Orçamento não encontrado"}</h3>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/${workspaceId}/dashboard/orcamentos`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Orçamentos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/${workspaceId}/dashboard/orcamentos`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamento #{orcamento.id}</h1>
            <p className="text-muted-foreground">
              Criado em {formatDate(orcamento.data_criacao)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={`text-sm ${statusColors[orcamento.status as keyof typeof statusColors]}`}
          >
            {statusLabels[orcamento.status as keyof typeof statusLabels]}
          </Badge>
          {(orcamento.status === "RASCUNHO" || orcamento.status === "ENVIADO") && (
            <>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleEditOrcamento}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDeleteOrcamento}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Cards de informações */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Informações do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-lg font-medium">{orcamento.cliente.nome}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">CPF/CNPJ</label>
              <p>{orcamento.cliente.cpf_cnpj}</p>
            </div>
            {orcamento.cliente.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {orcamento.cliente.email}
                </p>
              </div>
            )}
            {orcamento.cliente.telefone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {orcamento.cliente.telefone}
                </p>
              </div>
            )}
            {orcamento.cliente.endereco && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {orcamento.cliente.endereco}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo do Orçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumo do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(orcamento.valor_total)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Responsável</label>
              <p className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {orcamento.usuario.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(orcamento.data_criacao)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Itens</label>
              <p className="text-lg font-medium">{orcamento.itensOrcamento.length} item(s)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Itens do Orçamento */}
      <Card>
        <CardHeader>
          <CardTitle>Itens do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto/Serviço</TableHead>
                <TableHead className="text-center">Quantidade</TableHead>
                <TableHead className="text-right">Preço Unitário</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Desconto</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orcamento.itensOrcamento.map((item) => {
                const descontoInfo = getDescontoInfo(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.produtoServico.nome}</div>
                        {item.produtoServico.descricao && (
                          <div className="text-sm text-muted-foreground">
                            {item.produtoServico.descricao}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantidade}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.preco_unitario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(calculateSubtotal(item.quantidade, item.preco_unitario))}
                    </TableCell>
                    <TableCell className="text-right">
                      {descontoInfo ? (
                        <div className="text-sm">
                          <div className="text-red-600">
                            -{formatCurrency(Math.round(descontoInfo.desconto))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {descontoInfo.tipo === "percentual" 
                              ? `${descontoInfo.valor}%` 
                              : "Valor fixo"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Math.round(calculateItemTotal(item)))}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          <Separator className="my-4" />
          
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-lg font-semibold">
                Total: {formatCurrency(orcamento.valor_total)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {orcamento.observacoes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{orcamento.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de Edição */}
      {orcamento && orcamento.id && (
        <EditOrcamentoModal
          orcamentoId={orcamento.id}
          workspaceId={workspaceId}
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onOrcamentoUpdated={handleOrcamentoUpdated}
        />
      )}

      {/* Modal de Exclusão */}
      {orcamento && (
        <DeleteOrcamentoModal
          orcamentoId={orcamento.id}
          orcamentoNumero={orcamento.id.toString()}
          clienteNome={orcamento.cliente.nome}
          valorTotal={orcamento.valor_total}
          workspaceId={workspaceId}
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onOrcamentoDeleted={handleOrcamentoDeleted}
        />
      )}
    </div>
  )
}
