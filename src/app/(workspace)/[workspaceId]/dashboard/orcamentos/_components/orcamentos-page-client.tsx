"use client"

import React, { useState } from "react"
import { CreateOrcamentoModal } from "./create-orcamento-modal"
import { OrcamentosContent } from "./orcamentos-content"
import { OrcamentosStats } from "./orcamentos-stats"
import { SearchInput } from "@/components/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDownIcon, CalendarIcon, X, Download, Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { convertOrcamentosToCSV, downloadCSV } from "@/lib/csv-utils"
import { toast } from "sonner"

interface OrcamentosPageClientProps {
  workspaceId: string
}

interface OrcamentoItem {
  id: number
  quantidade: number
  preco_unitario: number
  desconto_percentual: number | null
  desconto_valor: number | null
  produto_nome: string
  produto_tipo: string | null
  produto_tipo_valor: string | null
}

interface Orcamento {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  observacoes: string | null
  cliente_nome: string
  cliente_cpf_cnpj: string | null
  cliente_telefone?: string | null
  cliente_email?: string | null
  cliente_endereco?: string | null
  cliente_bairro?: string | null
  cliente_cidade?: string | null
  cliente_estado?: string | null
  cliente_cep?: string | null
  usuario: {
    name: string
  }
  itensOrcamento: OrcamentoItem[]
}

export function OrcamentosPageClient({ workspaceId }: OrcamentosPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [responsavelFilter, setResponsavelFilter] = useState<string>("all")
  const [responsaveis, setResponsaveis] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  const handleOrcamentoCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleResponsaveisLoaded = (responsaveisData: string[]) => {
    setResponsaveis(responsaveisData)
  }

  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos`)
      if (!response.ok) {
        throw new Error('Erro ao buscar orçamentos')
      }

      const orcamentos: Orcamento[] = await response.json()

      if (orcamentos.length === 0) {
        toast.info('Não há orçamentos para exportar')
        return
      }

      // Converte para formato CSV - cada item do orçamento vira uma linha
      const csvData: any[] = []
      
      orcamentos.forEach(orcamento => {
        const dataCriacao = format(new Date(orcamento.data_criacao), "dd/MM/yyyy HH:mm", { locale: ptBR })
        const valorTotal = orcamento.valor_total ? (orcamento.valor_total / 100).toFixed(2) : '0.00'

        // Se não tem itens, adiciona uma linha com dados do orçamento
        if (orcamento.itensOrcamento.length === 0) {
          csvData.push({
            id: orcamento.id,
            data_criacao: dataCriacao,
            valor_total: valorTotal,
            status: orcamento.status,
            observacoes: orcamento.observacoes || '',
            cliente_nome: orcamento.cliente_nome,
            cliente_cpf_cnpj: orcamento.cliente_cpf_cnpj || '',
            cliente_telefone: orcamento.cliente_telefone || '',
            cliente_email: orcamento.cliente_email || '',
            cliente_endereco: orcamento.cliente_endereco || '',
            cliente_bairro: orcamento.cliente_bairro || '',
            cliente_cidade: orcamento.cliente_cidade || '',
            cliente_estado: orcamento.cliente_estado || '',
            cliente_cep: orcamento.cliente_cep || '',
            responsavel: orcamento.usuario.name,
            item_produto_nome: '',
            item_produto_tipo: '',
            item_produto_tipo_valor: '',
            item_quantidade: 0,
            item_preco_unitario: '0.00',
            item_desconto_percentual: '',
            item_desconto_valor: '',
            item_subtotal: '0.00'
          })
        } else {
          // Para cada item, cria uma linha
          orcamento.itensOrcamento.forEach(item => {
            const precoUnitario = (item.preco_unitario / 100).toFixed(2)
            const descontoPercentual = item.desconto_percentual ? item.desconto_percentual.toString() : ''
            const descontoValor = item.desconto_valor ? (item.desconto_valor / 100).toFixed(2) : ''
            
            // Calcula subtotal do item
            let subtotal = item.quantidade * item.preco_unitario
            if (item.desconto_percentual) {
              subtotal = subtotal - (subtotal * (item.desconto_percentual / 100))
            } else if (item.desconto_valor) {
              subtotal = subtotal - item.desconto_valor
            }
            const subtotalFormatted = (subtotal / 100).toFixed(2)

            csvData.push({
              id: orcamento.id,
              data_criacao: dataCriacao,
              valor_total: valorTotal,
              status: orcamento.status,
              observacoes: orcamento.observacoes || '',
              cliente_nome: orcamento.cliente_nome,
              cliente_cpf_cnpj: orcamento.cliente_cpf_cnpj || '',
              cliente_telefone: '',
              cliente_email: '',
              cliente_endereco: '',
              cliente_bairro: '',
              cliente_cidade: '',
              cliente_estado: '',
              cliente_cep: '',
              responsavel: orcamento.usuario.name,
              item_produto_nome: item.produto_nome,
              item_produto_tipo: item.produto_tipo || '',
              item_produto_tipo_valor: item.produto_tipo_valor || '',
              item_quantidade: item.quantidade,
              item_preco_unitario: precoUnitario,
              item_desconto_percentual: descontoPercentual,
              item_desconto_valor: descontoValor,
              item_subtotal: subtotalFormatted
            })
          })
        }
      })

      const csvContent = convertOrcamentosToCSV(csvData)
      const filename = `orcamentos_${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      toast.success('Orçamentos exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar orçamentos')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground hidden sm:block">
            Gerencie seus orçamentos e acompanhe estatísticas importantes
          </p>
        </div>
        <CreateOrcamentoModal
          workspaceId={workspaceId}
          onOrcamentoCreated={handleOrcamentoCreated}
        />
      </div>
      <OrcamentosStats workspaceId={workspaceId} />
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por ID, nome do cliente, CPF/CNPJ ou responsável"
          />
        </div>
        <div className="w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="RASCUNHO">Rascunho</SelectItem>
              <SelectItem value="ENVIADO">Enviado</SelectItem>
              <SelectItem value="APROVADO">Aprovado</SelectItem>
              <SelectItem value="REJEITADO">Rejeitado</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Responsáveis</SelectItem>
              {responsaveis.map((responsavel) => (
                <SelectItem key={responsavel} value={responsavel}>
                  {responsavel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <div className="flex flex-col gap-3">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full md:w-auto justify-between font-normal gap-x-2"
                >
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                    )
                  ) : (
                    "Selecionar período"
                  )}
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
                {dateRange?.from && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setDateRange(undefined)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar período
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="hover:border-sky-600 cursor-pointer hover:text-sky-600 w-full md:w-auto"
          onClick={handleExportCSV}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </>
          )}
        </Button>
      </div>


      <OrcamentosContent
        workspaceId={workspaceId}
        refreshTrigger={refreshTrigger}
        search={search}
        statusFilter={statusFilter}
        responsavelFilter={responsavelFilter}
        dateRange={dateRange}
        onResponsaveisLoaded={handleResponsaveisLoaded}
      />
    </>
  )
}
