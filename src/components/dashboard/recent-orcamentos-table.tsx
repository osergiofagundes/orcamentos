import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RecentOrcamento } from "@/hooks/use-dashboard-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HandCoins, FileText, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface RecentOrcamentosTableProps {
  orcamentos: RecentOrcamento[]
  workspaceId: string
}

export function RecentOrcamentosTable({ orcamentos, workspaceId }: RecentOrcamentosTableProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RASCUNHO':
        return <Badge variant="secondary">Rascunho</Badge>
      case 'ENVIADO':
        return <Badge variant="default">Enviado</Badge>
      case 'APROVADO':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">Aprovado</Badge>
      case 'REJEITADO':
        return <Badge variant="destructive">Rejeitado</Badge>
      case 'CANCELADO':
        return <Badge variant="secondary">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">Últimos Orçamentos</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/${workspaceId}/dashboard/orcamentos`)}
          className="text-muted-foreground cursor-pointer hover:text-sky-600"
        >
          <HandCoins className="h-4 w-4" />
          Mais detalhes
        </Button>
      </CardHeader>
      <CardContent>
        {orcamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <HandCoins className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum orçamento cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie orçamentos para ver os dados aqui
            </p>
            <Button 
              onClick={() => router.push(`/${workspaceId}/dashboard/orcamentos`)}
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Criar Orçamento
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap min-w-[120px]">Cliente</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[90px]">Status</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[100px]">Valor Total</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[120px]">Responsável</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[110px]">Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orcamentos.map((orcamento) => (
                  <TableRow key={orcamento.id}>
                    <TableCell className="font-medium whitespace-nowrap">{orcamento.cliente_nome}</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(orcamento.status)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatPrice(orcamento.valor_total)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{orcamento.responsavel}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(orcamento.data_criacao)}</TableCell>
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