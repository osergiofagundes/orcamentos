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
import { User, Building, Phone, Mail, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Client {
  id: number
  nome: string
  cpf_cnpj: string
  telefone: string
  email: string
  endereco: string
  createdAt: string
  updatedAt: string
}

interface ClientsListClientProps {
  workspaceId: string
  refreshTrigger: number
  search: string
}

export function ClientsListClient({ workspaceId, refreshTrigger, search }: ClientsListClientProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [workspaceId, refreshTrigger])

  const loadClients = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/clientes`)
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCpfCnpj = (cpfCnpj: string) => {
    const numbersOnly = cpfCnpj.replace(/\D/g, '')

    if (numbersOnly.length === 11) {
      // CPF
      return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (numbersOnly.length === 14) {
      // CNPJ
      return cpfCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return cpfCnpj
  }

  const getClientType = (cpfCnpj: string) => {
    const numbersOnly = cpfCnpj.replace(/\D/g, '')
    return numbersOnly.length === 11 ? 'PF' : 'PJ'
  }

  const formatPhone = (phone: string) => {
    if (!phone) return "-"
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  // Função para filtrar clientes baseado na busca
  const filteredClients = clients.filter(client => {
    if (!search || search.trim() === '') return true
    
    const searchTerm = search.toLowerCase().trim()
    
    // Função auxiliar para busca em texto
    const matchesText = (text: string | number | null | undefined): boolean => {
      if (text === null || text === undefined) return false
      return text.toString().toLowerCase().includes(searchTerm)
    }
    
    // Função auxiliar para busca em números (telefone, CPF/CNPJ)
    const matchesNumber = (text: string | null | undefined): boolean => {
      if (!text) return false
      
      // Busca no texto original (com formatação)
      if (text.toLowerCase().includes(searchTerm)) return true
      
      // Busca apenas nos números (sem formatação)
      const numbersOnly = text.replace(/\D/g, '')
      const searchNumbersOnly = searchTerm.replace(/\D/g, '')
      
      if (searchNumbersOnly && numbersOnly.includes(searchNumbersOnly)) return true
      
      return false
    }
    
    // Verifica se o termo de busca está presente em qualquer campo
    return (
      matchesText(client.id) ||
      matchesText(client.nome) ||
      matchesNumber(client.cpf_cnpj) ||
      matchesNumber(client.telefone) ||
      matchesText(client.email)
    )
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground">
            Comece criando seu primeiro cliente clicando no botão "Novo Cliente".
          </p>
        </CardContent>
      </Card>
    )
  }

  if (filteredClients.length === 0 && search) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
          <p className="text-muted-foreground">
            Não foram encontrados clientes que correspondam à sua busca por "{search}".
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabela de clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">#{client.id}</TableCell>
                  <TableCell>{client.nome}</TableCell>
                  <TableCell>
                    <span className="text-sm flex items-center gap-1">
                      {getClientType(client.cpf_cnpj) === 'PF' ? (
                        <User className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building className="h-4 w-4 text-muted-foreground" />
                      )}
                      {formatCpfCnpj(client.cpf_cnpj)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatPhone(client.telefone)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(client.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ClientActions
                      client={client}
                      workspaceId={workspaceId}
                      onUpdate={loadClients}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
