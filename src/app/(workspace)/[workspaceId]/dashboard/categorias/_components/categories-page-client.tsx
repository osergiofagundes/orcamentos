"use client"

import React, { useState } from "react"
import { CreateCategoryModal } from "./create-category-modal"
import { CategoriesContent } from "./categories-content"
import { CategoriesStats } from "./categories-stats"
import { ImportCategoriasCSVModal } from "./import-categorias-csv-modal"
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
import { CalendarIcon, Download, Lock, NotepadTextDashed, Upload, X, Loader2 } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { convertCategoriasToCSV, downloadCSV, generateCategoriasCSVTemplate } from "@/lib/csv-utils"
import { toast } from "sonner"

interface CategoriesPageClientProps {
  workspaceId: string
}

interface Category {
  id: number
  nome: string
}

export function CategoriesPageClient({ workspaceId }: CategoriesPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const { canManageCategories, userLevel, isLoading } = useUserPermissions(workspaceId)
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleCategoryCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleImportSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setImportModalOpen(false)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/categorias`)
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias')
      }

      const categories: Category[] = await response.json()

      if (categories.length === 0) {
        toast.info('Não há categorias para exportar')
        return
      }

      // Converte para formato CSV
      const csvData = categories.map(category => ({
        nome: category.nome,
      }))

      const csvContent = convertCategoriasToCSV(csvData)
      const filename = `categorias_${new Date().toISOString().split('T')[0]}.csv`
      
      downloadCSV(csvContent, filename)
      toast.success('Categorias exportadas com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      toast.error('Erro ao exportar categorias')
    } finally {
      setExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateCategoriasCSVTemplate()
    downloadCSV(template, 'template_categorias.csv')
    toast.success('Template baixado com sucesso!')
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="hidden text-muted-foreground sm:block">
            Gerencie as categorias dos seus produtos e serviços
          </p>
        </div>
        {canManageCategories ? (
          <CreateCategoryModal
            workspaceId={workspaceId}
            onCategoryCreated={handleCategoryCreated}
          />
        ) : null}
      </div>
      
      {!canManageCategories && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Você possui acesso somente para visualização.
          </AlertDescription>
        </Alert>
      )}

      <CategoriesStats workspaceId={workspaceId} />

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar categorias por ID, nome ou descrição"
          />
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
      {canManageCategories && (
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

      <ImportCategoriasCSVModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        workspaceId={workspaceId}
        onImportSuccess={handleImportSuccess}
      />

      <CategoriesContent 
        workspaceId={workspaceId} 
        refreshTrigger={refreshTrigger} 
        search={search}
        canManageCategories={canManageCategories}
        dateRange={dateRange}
      />
    </>
  )
}
