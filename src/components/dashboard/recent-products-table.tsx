import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RecentProduct } from "@/hooks/use-dashboard-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface RecentProductsTableProps {
  products: RecentProduct[]
  workspaceId: string
}

export function RecentProductsTable({ products, workspaceId }: RecentProductsTableProps) {
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

  const getTypeBadge = (tipo: 'PRODUTO' | 'SERVICO') => {
    const variant = tipo === 'PRODUTO' ? 'bg-sky-600' : 'outline outline-gray-300 bg-transparent text-black'
    const label = tipo === 'PRODUTO' ? 'Produto' : 'Serviço'
    
    return <Badge className={variant}>{label}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">Últimos Produtos/Serviços</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push(`/${workspaceId}/dashboard/produtos-e-servicos`)}
          className="text-muted-foreground cursor-pointer hover:text-sky-600"
        >
          <Package className="h-4 w-4"/>
          Mais detalhes
        </Button>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum produto/serviço cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cadastre produtos ou serviços para ver os dados aqui
            </p>
            <Button 
              onClick={() => router.push(`/${workspaceId}/dashboard/produtos-e-servicos`)}
              size="sm"
              className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Cadastrar Produto/Serviço
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap min-w-[120px]">Nome</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[80px]">Tipo</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[100px]">Valor</TableHead>
                  <TableHead className="whitespace-nowrap min-w-[110px]">Adicionado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium whitespace-nowrap">{product.nome}</TableCell>
                    <TableCell className="whitespace-nowrap">{getTypeBadge(product.tipo)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatPrice(product.valor)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(product.data_criacao)}</TableCell>
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