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
import { CalendarIcon, Lock, X, Tag } from "lucide-react"
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
            onCategoriesLoaded={(loadedCategories) => {
              setCategories(loadedCategories)
            }}
          />
        </div>
      </div>
    </>
  )
}
