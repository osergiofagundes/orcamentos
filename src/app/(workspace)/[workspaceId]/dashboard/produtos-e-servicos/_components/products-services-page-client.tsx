"use client"

import React, { useState } from "react"
import { ProductsServicesStats } from "./products-services-stats"
import { ProductsTable } from "./products-table"
import { CreateProductButton } from "./create-product-button"
import { ImportProdutosCSVModal } from "./import-produtos-csv-modal"
import { SearchInput } from "@/components/search-input"
import { useUserPermissions } from "@/hooks/use-user-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Lock, X, Tag, Ruler, Package, Download, Upload, NotepadTextDashed, Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { convertProdutosToCSV, downloadCSV, generateProdutosCSVTemplate } from "@/lib/csv-utils"
import { toast } from "sonner"

interface ProductsServicesPageClientProps {
  workspaceId: string
}

interface Product {
  id: number
  nome: string
  valor?: number | null
  tipo: "PRODUTO" | "SERVICO"
  tipo_valor: string
  categoria_id: number | null
  categoria: {
    id: number
    nome: string
  } | null
}

export function ProductsServicesPageClient({ workspaceId }: ProductsServicesPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const { canManageProducts, userLevel, isLoading } = useUserPermissions(workspaceId)
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")
  const [categories, setCategories] = React.useState<string[]>([])
  const [tipoValorFilter, setTipoValorFilter] = React.useState<string>("all")
  const [tiposValor, setTiposValor] = React.useState<string[]>([])
  const [tipoFilter, setTipoFilter] = React.useState<string>("all")
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleDataChanged = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setImportModalOpen(false)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/produtos`)
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos')
      }

      const products: Product[] = await response.json()

      if (products.length === 0) {
        toast.info('Não há produtos para exportar')
        return
      }

      // Converte para formato CSV
      const csvData = products.map(product => ({
        nome: product.nome,
        valor: product.valor ? (product.valor / 100).toFixed(2) : '',
        tipo: product.tipo,
        tipo_valor: product.tipo_valor as "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO",
        categoria: product.categoria?.nome || '',
      }))

      const csvContent = convertProdutosToCSV(csvData)
      const filename = `produtos_servicos_${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      toast.success('Produtos e serviços exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar produtos e serviços')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateProdutosCSVTemplate()
    downloadCSV(template, 'template_produtos_servicos.csv')
    toast.success('Template baixado com sucesso!')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Produtos & Serviços</h1>
          <p className="hidden text-muted-foreground sm:block">
            Gerencie seu catálogo completo de produtos e serviços
          </p>
        </div>
        {canManageProducts ? (
          <CreateProductButton
            workspaceId={workspaceId}
            onProductCreated={handleDataChanged}
          />
        ) : null}
      </div>

      {!canManageProducts && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você possui acesso somente para visualização.
          </AlertDescription>
        </Alert>
      )}

      <ProductsServicesStats workspaceId={workspaceId} />

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar por ID, nome, descrição ou categoria"
          />
        </div>
        <div className="w-full md:w-auto">
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <SelectValue placeholder="Todas as categorias" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-48">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <SelectValue placeholder="Produtos e Serviços" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Produtos e Serviços</SelectItem>
                <SelectItem value="PRODUTO">Produtos</SelectItem>
                <SelectItem value="SERVICO">Serviços</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={tipoValorFilter} onValueChange={setTipoValorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <SelectValue placeholder="Todos os tipos" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tiposValor.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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

      {canManageProducts && (
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
      )}

      <ImportProdutosCSVModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        workspaceId={workspaceId}
        onImportSuccess={handleImportSuccess}
      />

      <div className="space-y-6">
        <div>
          <ProductsTable
            workspaceId={workspaceId}
            refreshTrigger={refreshTrigger}
            onDataChanged={handleDataChanged}
            search={search}
            canManageProducts={canManageProducts}
            dateRange={dateRange}
            categoryFilter={categoryFilter}
            tipoFilter={tipoFilter}
            tipoValorFilter={tipoValorFilter}
            onCategoriesLoaded={(loadedCategories) => {
              setCategories(loadedCategories)
            }}
            onTiposValorLoaded={(loadedTipos) => {
              setTiposValor(loadedTipos)
            }}
          />
        </div>
      </div>
    </>
  )
}
