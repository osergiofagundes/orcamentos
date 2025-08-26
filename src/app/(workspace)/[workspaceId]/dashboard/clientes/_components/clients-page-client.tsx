"use client"

import React, { useState } from "react"
import { CreateClientModal } from "./create-client-modal"
import { ClientsContent } from "./clients-content"
import { ClientsStats } from "./clients-stats"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ClientsPageClientProps {
  workspaceId: string
}

export function ClientsPageClient({ workspaceId }: ClientsPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [search, setSearch] = useState("")
  const [open, setOpen] = React.useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)

  const handleClientCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e acompanhe estatísticas importantes
          </p>
        </div>
        <CreateClientModal 
          workspaceId={workspaceId}
          onClientCreated={handleClientCreated}
        />
      </div>
      <ClientsStats workspaceId={workspaceId} />

      <div className="flex flex-colmd:flex-row md:space-x-3">
        <div className="w-full md:w-2/3">
          <SearchInput 
            value={search} 
            onChange={setSearch} 
            placeholder="Pesquisar clientes por ID, nome, CPF/CNPJ, telefone ou email" 
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

      <ClientsContent workspaceId={workspaceId} refreshTrigger={refreshTrigger} search={search} dateRange={dateRange} />
    </>
  )
}
