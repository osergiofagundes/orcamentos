"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClientActions } from "./client-actions"
import { Badge } from "@/components/ui/badge"
import { User, Building, Phone, Mail, Calendar, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

interface Client {
  id: number
  nome: string
  email: string | null
  telefone: string | null
  tipo_pessoa: "PF" | "PJ"
  documento: string | null
  cpf_cnpj: string
  endereco: string | null
  createdAt: string
  updatedAt: string
}

interface ClientsListProps {
  workspaceId: string
}

export function ClientsList({ workspaceId }: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/clientes`)

        if (response.ok) {
          const data = await response.json()
          setClients(data)
          setFilteredClients(data)
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [workspaceId])

  useEffect(() => {
    const filtered = clients.filter(client =>
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefone?.includes(searchTerm) ||
      client.documento?.includes(searchTerm)
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return "-"
    // Formatar telefone brasileiro
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const formatDocument = (document: string | null, type: "PF" | "PJ") => {
    if (!document) return "-"
    const cleaned = document.replace(/\D/g, '')
    
    if (type === "PF" && cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
    } else if (type === "PJ" && cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
    }
    return document
  }

  const onClientUpdate = () => {
    // Recarregar dados após atualização
    const fetchClients = async () => {
      try {
        const response = await fetch(`/api/workspace/${workspaceId}/clientes`)
        if (response.ok) {
          const data = await response.json()
          setClients(data)
          setFilteredClients(data)
        }
      } catch (error) {
        console.error("Erro ao recarregar clientes:", error)
      }
    }
    fetchClients()
  }

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-muted animate-pulse rounded w-48" />
              <div className="h-4 bg-muted animate-pulse rounded w-64" />
            </div>
            <div className="h-10 bg-muted animate-pulse rounded w-48" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Lista de Clientes
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {filteredClients.length} {filteredClients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </p>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm 
                ? "Tente ajustar os termos de busca para encontrar o que procura."
                : "Comece cadastrando seus primeiros clientes para gerenciar seu negócio."
              }
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/10">
                <TableHead className="font-semibold">Cliente</TableHead>
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Tipo</TableHead>
                <TableHead className="font-semibold">Documento</TableHead>
                <TableHead className="font-semibold">Cadastrado em</TableHead>
                <TableHead className="font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="hover:bg-muted/30 transition-colors border-b border-muted/20"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{client.nome}</p>
                      {client.endereco && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {client.endereco}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{client.email}</span>
                        </div>
                      )}
                      {client.telefone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{formatPhone(client.telefone)}</span>
                        </div>
                      )}
                      {!client.email && !client.telefone && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={client.tipo_pessoa === "PF" ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {client.tipo_pessoa === "PF" ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Building className="h-3 w-3" />
                      )}
                      {client.tipo_pessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">
                      {formatDocument(client.documento, client.tipo_pessoa)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(client.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClientActions 
                      client={{
                        id: client.id,
                        nome: client.nome,
                        cpf_cnpj: client.cpf_cnpj,
                        telefone: client.telefone || "",
                        email: client.email || "",
                        endereco: client.endereco || "",
                      }} 
                      workspaceId={workspaceId}
                      onUpdate={onClientUpdate}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
