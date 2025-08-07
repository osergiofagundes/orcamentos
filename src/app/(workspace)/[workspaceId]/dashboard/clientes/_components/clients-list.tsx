import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
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

interface ClientsListProps {
  workspaceId: string
}

export async function ClientsList({ workspaceId }: ClientsListProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return null
  }

  try {
    // Verificar acesso ao workspace
    const hasAccess = await prisma.usuarioAreaTrabalho.findFirst({
      where: {
        usuario_id: session.user.id,
        area_trabalho_id: parseInt(workspaceId),
      },
    })

    if (!hasAccess) {
      return null
    }

    const clients = await prisma.cliente.findMany({
      where: {
        area_trabalho_id: parseInt(workspaceId),
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

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

    return (
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum cliente cadastrado ainda.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.nome}</TableCell>
                    <TableCell>{formatCpfCnpj(client.cpf_cnpj)}</TableCell>
                    <TableCell>
                      <Badge variant={getClientType(client.cpf_cnpj) === 'PF' ? 'default' : 'secondary'}>
                        {getClientType(client.cpf_cnpj)}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telefone}</TableCell>
                    <TableCell className="text-right">
                      <ClientActions client={client} workspaceId={workspaceId} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error("Failed to fetch clients:", error)
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Erro ao carregar clientes.
          </p>
        </CardContent>
      </Card>
    )
  }
}
