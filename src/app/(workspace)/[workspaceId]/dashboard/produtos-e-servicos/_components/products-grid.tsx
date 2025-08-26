import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductActions } from "./product-actions"

interface ProductsGridProps {
  workspaceId: string
}

export async function ProductsGrid({ workspaceId }: ProductsGridProps) {
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

    const products = await prisma.produtoServico.findMany({
      where: {
        area_trabalho_id: parseInt(workspaceId),
        deletedAt: null,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formatCurrency = (value: number | null | undefined) => {
      if (value === null || value === undefined) return "R$ 0,00"
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value / 100)
    }

    const formatTipoValor = (tipo: "UNIDADE" | "METRO" | "METRO_QUADRADO" | "METRO_CUBICO" | "CENTIMETRO" | "DUZIA" | "QUILO" | "GRAMA" | "QUILOMETRO" | "LITRO" | "MINUTO" | "HORA" | "DIA" | "MES" | "ANO") => {
      const tipoLabels = {
        UNIDADE: "Unidades",
        METRO: "Metros", 
        METRO_QUADRADO: "Metros Quadrados",
        METRO_CUBICO: "Metro Cúbico",
        CENTIMETRO: "Centímetros",
        DUZIA: "Dúzias",
        QUILO: "Quilo",
        GRAMA: "Grama",
        QUILOMETRO: "Quilômetro",
        LITRO: "Litros",
        MINUTO: "Minutos",
        HORA: "Horas",
        DIA: "Dias",
        MES: "Meses",
        ANO: "Anos"
      }
      return tipoLabels[tipo]
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Produtos & Serviços</h2>
        </div>
        
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Nenhum produto/serviço cadastrado ainda.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="relative group hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {product.nome}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge 
                          variant={product.tipo === "PRODUTO" ? "default" : "secondary"}
                          className={product.tipo === "PRODUTO" ? 
                            "bg-blue-600 text-white" : 
                            "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          }
                        >
                          {product.tipo === "PRODUTO" ? "Produto" : "Serviço"}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          {product.categoria.nome}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className="text-xs"
                        >
                          {formatTipoValor(product.tipo_valor)}
                        </Badge>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ProductActions product={product} workspaceId={workspaceId} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(product.valor)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Criado em {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Erro ao carregar produtos/serviços.
          </p>
        </CardContent>
      </Card>
    )
  }
}
