"use client"

import React, { useState } from "react"
import { CreateCategoryModal } from "./create-category-modal"
import { CategoriesContent } from "./categories-content"
import { CategoriesStats } from "./categories-stats"
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
import { CalendarIcon, Lock, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CategoriesPageClientProps {
  workspaceId: string
}

export function CategoriesPageClient({ workspaceId }: CategoriesPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const { canManageCategories, userLevel, isLoading } = useUserPermissions(workspaceId)
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const handleCategoryCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
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

      <div className="flex flex-col gap-3 md:flex-row md:space-x-3">
        <div className="w-full md:w-2/3">
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
