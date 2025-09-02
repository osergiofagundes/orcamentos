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
import { ChevronDownIcon, CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface OrcamentosPageClientProps {
  workspaceId: string
}

export function OrcamentosPageClient({ workspaceId }: OrcamentosPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [responsavelFilter, setResponsavelFilter] = useState<string>("all")
  const [responsaveis, setResponsaveis] = useState<string[]>([])

  const handleOrcamentoCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleResponsaveisLoaded = (responsaveisData: string[]) => {
    setResponsaveis(responsaveisData)
  }

  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">
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
