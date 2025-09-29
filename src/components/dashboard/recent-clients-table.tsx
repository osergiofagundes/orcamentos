import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RecentClient } from "@/hooks/use-dashboard-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface RecentClientsTableProps {
  clients: RecentClient[]
  workspaceId: string
}

export function RecentClientsTable({ clients, workspaceId }: RecentClientsTableProps) {
  const router = useRouter()
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-'
    
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')
    
    // Formato para celular (11 dígitos)
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    
    // Formato para telefone fixo (10 dígitos)
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    return phone
  }

  const formatCpfCnpj = (cpfCnpj: string) => {
    if (!cpfCnpj) return '-'
    
    // Remove todos os caracteres não numéricos
    const cleaned = cpfCnpj.replace(/\D/g, '')
    
    // Formato para CPF (11 dígitos)
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
    }
    
    // Formato para CNPJ (14 dígitos)
    if (cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
    }
    
    return cpfCnpj
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">Últimos Clientes</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre clientes para ver os dados aqui
            </p>
            <Button 
              onClick={() => router.push(`/${workspaceId}/dashboard/clientes`)}
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Cliente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap min-w-[120px]">Nome</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[140px]">CPF/CNPJ</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[120px]">Telefone</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[110px]">Adicionado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium whitespace-nowrap">{client.nome}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm whitespace-nowrap">{formatCpfCnpj(client.cpf_cnpj)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatPhone(client.telefone)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(client.data_criacao)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}