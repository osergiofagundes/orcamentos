"use client"

import React, { useState } from "react"
import { ProductsServicesStats } from "./products-services-stats"
import { ProductsTable } from "./products-table"
import { CreateProductButton } from "./create-product-button"
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
import { CalendarIcon, Lock, X, Tag, Ruler, Package } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ProductsServicesPageClientProps {
  workspaceId: string
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

  const handleDataChanged = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Produtos & Serviços</h1>
          <p className="text-muted-foreground">
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

      <div className="flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0">
        <div className="w-full md:flex-1">
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
