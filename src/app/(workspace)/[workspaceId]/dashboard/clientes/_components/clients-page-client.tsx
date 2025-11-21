"use client"

import React, { useState } from "react"
import { CreateClientModal } from "./create-client-modal"
import { ClientsContent } from "./clients-content"
import { ClientsStats } from "./clients-stats"
import { ImportCSVModal } from "./import-csv-modal"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Download, Loader2, NotepadTextDashed, Upload, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { convertToCSV, downloadCSV, generateCSVTemplate } from "@/lib/csv-utils"
import { toast } from "sonner"

interface ClientsPageClientProps {
  workspaceId: string
}

interface Client {
  id: number
  nome: string
  cpf_cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
}

export function ClientsPageClient({ workspaceId }: ClientsPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleClientCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setImportModalOpen(false)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/clientes`)
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes')
      }

      const clients: Client[] = await response.json()

      if (clients.length === 0) {
        toast.info('Não há clientes para exportar')
        return
      }

      // Converte para formato CSV
      const csvData = clients.map(client => ({
        nome: client.nome,
        cpf_cnpj: client.cpf_cnpj || '',
        telefone: client.telefone || '',
        email: client.email || '',
        endereco: client.endereco || '',
        bairro: client.bairro || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        cep: client.cep || '',
      }))

      const csvContent = convertToCSV(csvData)
      const filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      toast.success('Clientes exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar clientes')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate()
    downloadCSV(template, 'template_clientes.csv')
    toast.success('Template baixado com sucesso!')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="hidden text-muted-foreground sm:block">
            Gerencie seus clientes e acompanhe estatísticas importantes
          </p>
        </div>



        <CreateClientModal
          workspaceId={workspaceId}
          onClientCreated={handleClientCreated}
        />
      </div>
      <ClientsStats workspaceId={workspaceId} />

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar clientes por ID, nome, CPF/CNPJ, telefone ou email"
          />
        </div>
        <div className="w-full md:w-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-auto">
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
                        className="w-full hover:text-red-500 hover:border-red-500 cursor-pointer"
                        onClick={() => setDateRange(undefined)}
                      >
                        Limpar período
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
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

        <Button 
          variant="outline" 
          size="sm" 
          className="hover:border-sky-600 cursor-pointer hover:text-sky-600 w-full md:w-auto"
          onClick={() => setImportModalOpen(true)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar CSV
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          className="hover:border-sky-600 cursor-pointer hover:text-sky-600 w-full md:w-auto"
          onClick={handleDownloadTemplate}
        >
          <NotepadTextDashed className="h-4 w-4 mr-2" />
          Baixar Template
        </Button>
      </div>

      <ImportCSVModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        workspaceId={workspaceId}
        onImportSuccess={handleImportSuccess}
      />

      <ClientsContent workspaceId={workspaceId} refreshTrigger={refreshTrigger} search={search} dateRange={dateRange} />
    </>
  )
}
