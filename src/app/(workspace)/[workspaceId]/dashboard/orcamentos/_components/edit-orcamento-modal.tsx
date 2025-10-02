"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, Package, User, Calculator, FileText, AlertCircle, Edit } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const editOrcamentoSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    id: z.number().optional(),
    produtoServicoId: z.string().min(1, "Selecione um produto/serviço"),
    quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
    precoUnitario: z.number().min(0, "Preço deve ser maior ou igual a 0"),
    descontoPercentual: z.number().min(0).max(100).optional(),
    descontoValor: z.number().min(0).optional(),
    tipoDesconto: z.enum(["percentual", "valor", "nenhum"]).optional(),
  })).min(1, "Adicione pelo menos um item"),
})

type EditOrcamentoForm = z.infer<typeof editOrcamentoSchema>

interface Cliente {
  id: number
  nome: string
  cpf_cnpj: string | null
}

interface ProdutoServico {
  id: number
  nome: string
  valor: number | null
  categoria: {
    nome: string
  }
}

interface OrcamentoDetalhado {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  observacoes?: string
  cliente: {
    id: number
    nome: string
    cpf_cnpj: string | null
  }
  usuario: {
    name: string
  }
  itensOrcamento: {
    id: number
    quantidade: number
    preco_unitario: number
    // Dados desnormalizados (sempre presentes)
    produto_nome: string
    produto_tipo: string
    produto_tipo_valor: string
    // Relação opcional (pode ser null se produto foi excluído)
    produtoServico?: {
      id: number
      nome: string
    } | null
  }[]
}

interface EditOrcamentoModalProps {
  orcamentoId: number
  workspaceId: string
  isOpen: boolean
  onClose: () => void
  onOrcamentoUpdated: () => void
}

export function EditOrcamentoModal({ 
  orcamentoId, 
  workspaceId, 
  isOpen, 
  onClose, 
  onOrcamentoUpdated 
}: EditOrcamentoModalProps) {
  const [orcamento, setOrcamento] = useState<OrcamentoDetalhado | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtosServicos, setProdutosServicos] = useState<ProdutoServico[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const form = useForm<EditOrcamentoForm>({
    resolver: zodResolver(editOrcamentoSchema),
    defaultValues: {
      clienteId: "",
      observacoes: "",
      itens: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itens",
  })

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, orcamentoId, workspaceId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [orcamentoRes, clientesRes, produtosRes] = await Promise.all([
        fetch(`/api/workspace/${workspaceId}/orcamentos/${orcamentoId}`),
        fetch(`/api/workspace/${workspaceId}/clientes`),
        fetch(`/api/workspace/${workspaceId}/produtos`),
      ])

      if (orcamentoRes.ok) {
        const orcamentoData = await orcamentoRes.json()
        setOrcamento(orcamentoData)
        
        // Verificar se os dados existem antes de popular o formulário
        if (orcamentoData && orcamentoData.cliente && orcamentoData.cliente.id) {
          form.setValue("clienteId", orcamentoData.cliente.id.toString())
        }
        
        form.setValue("observacoes", orcamentoData.observacoes || "")
        
        if (orcamentoData.itensOrcamento && Array.isArray(orcamentoData.itensOrcamento)) {
          form.setValue("itens", orcamentoData.itensOrcamento.map((item: any) => ({
            id: item.id,
            produtoServicoId: item.produtoServico?.id?.toString() || "deleted",
            quantidade: item.quantidade || 1,
            precoUnitario: (item.preco_unitario || 0) / 100, // Convert from cents
            descontoPercentual: parseFloat(item.desconto_percentual || 0),
            descontoValor: (item.desconto_valor || 0) / 100, // Convert from cents
            tipoDesconto: item.desconto_percentual > 0 ? "percentual" : item.desconto_valor > 0 ? "valor" : "nenhum",
          })))
        }
      } else {
        toast.error("Erro ao carregar orçamento")
        onClose()
      }

      if (clientesRes.ok) {
        const clientesData = await clientesRes.json()
        setClientes(clientesData)
      }

      if (produtosRes.ok) {
        const produtosData = await produtosRes.json()
        setProdutosServicos(produtosData)
      }
      
      setDataLoaded(true)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados")
      setDataLoaded(true)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EditOrcamentoForm) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos/${orcamentoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Orçamento atualizado com sucesso!")
        onClose()
        onOrcamentoUpdated()
        form.reset()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erro ao atualizar orçamento")
      }
    } catch (error) {
      console.error("Erro ao atualizar orçamento:", error)
      toast.error("Erro ao atualizar orçamento")
    } finally {
      setSaving(false)
    }
  }

  const updatePrecoFromProduto = (index: number, produtoId: string) => {
    // Não atualizar preço para produtos excluídos
    if (produtoId === "deleted") {
      return
    }
    
    const produto = produtosServicos.find(p => p.id.toString() === produtoId)
    if (produto && produto.valor) {
      form.setValue(`itens.${index}.precoUnitario`, produto.valor / 100) // Convert from cents
    }
  }

  const calculateItemTotal = (item: any) => {
    // Retorna apenas o valor bruto (quantidade x preço unitário) sem desconto
    return item.quantidade * item.precoUnitario
  }

  const calculateSubtotal = () => {
    const itens = form.watch("itens")
    return itens.reduce((total, item) => {
      return total + calculateItemTotal(item)
    }, 0)
  }

  const calculateDescontoTotal = () => {
    const itens = form.watch("itens")
    return itens.reduce((totalDesconto, item) => {
      const subtotalItem = item.quantidade * item.precoUnitario
      let desconto = 0
      
      if (item.tipoDesconto === "percentual" && item.descontoPercentual && item.descontoPercentual > 0) {
        desconto = subtotalItem * (item.descontoPercentual / 100)
      } else if (item.tipoDesconto === "valor" && item.descontoValor && item.descontoValor > 0) {
        desconto = item.descontoValor
      }
      
      return totalDesconto + desconto
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const descontoTotal = calculateDescontoTotal()
    return Math.max(0, subtotal - descontoTotal)
  }

  const handleClose = () => {
    if (!saving) {
      onClose()
      form.reset()
      setOrcamento(null)
    }
  }

  // Verificar se o orçamento pode ser editado
  const canEdit = orcamento && (orcamento.status === "RASCUNHO" || orcamento.status === "ENVIADO")

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl border-l-8 border-l-sky-600 rounded-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-left">
            Editar Orçamento #{orcamentoId}
          </DialogTitle>
          <DialogDescription className="text-left">
            {canEdit 
              ? "Modifique as informações do orçamento abaixo." 
              : "Este orçamento não pode ser editado devido ao seu status atual."
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : !canEdit ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Orçamentos com status "{orcamento?.status}" não podem ser modificados.
            </p>
          </div>
        ) : dataLoaded && (clientes.length === 0 || produtosServicos.length === 0) ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados necessários não encontrados</h3>
            <div className="space-y-2 text-muted-foreground">
              {clientes.length === 0 && (
                <p>• Você precisa cadastrar pelo menos um cliente antes de editar o orçamento.</p>
              )}
              {produtosServicos.length === 0 && (
                <p>• Você precisa cadastrar pelo menos um produto/serviço antes de editar o orçamento.</p>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Cadastre os dados necessários e tente novamente.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Seção de Informações Básicas */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <User className="h-5 w-5 text-primary" />
                  <DialogTitle>Cliente</DialogTitle>
                </div>
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                              {cliente.nome} - {cliente.cpf_cnpj || 'Sem CPF/CNPJ'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção de Itens do Orçamento */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-primary" />
                    <DialogTitle>Itens do Orçamento</DialogTitle>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ 
                      produtoServicoId: "", 
                      quantidade: 1, 
                      precoUnitario: 0,
                      descontoPercentual: 0,
                      descontoValor: 0,
                      tipoDesconto: "nenhum"
                    })}
                    className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 text-white hover:text-white'
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative bg-muted/30 border border-border rounded-xl p-6 transition-all hover:shadow-sm">
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <span className="bg-background px-2 py-1 rounded-full font-semibold">
                          Item {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-8 w-8 p-0 border hover:text-red-500 hover:border-red-500 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8">
                        <div className="lg:col-span-5">
                          <FormField
                            control={form.control}
                            name={`itens.${index}.produtoServicoId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Produto/Serviço *</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    updatePrecoFromProduto(index, value)
                                  }} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-11 w-full">
                                      <SelectValue placeholder="Selecione um produto/serviço" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {/* Mostrar produto excluído se for o caso */}
                                    {field.value === "deleted" && (
                                      <SelectItem key="deleted" value="deleted" disabled>
                                        <div className="flex gap-2 items-center text-muted-foreground">
                                          <span>Produto Excluído</span>
                                          <span className="text-xs">(não é mais possível selecionar)</span>
                                        </div>
                                      </SelectItem>
                                    )}
                                    {produtosServicos.map((produto) => (
                                      <SelectItem key={produto.id} value={produto.id.toString()}>
                                        <div className="flex gap-2 items-center">
                                          <span>{produto.nome}</span>
                                          <span>-</span>
                                          <span className="text-muted-foreground">{produto.categoria?.nome || 'Sem categoria'}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <FormField
                            control={form.control}
                            name={`itens.${index}.quantidade`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Quantidade *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    className="text-right"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <FormField
                            control={form.control}
                            name={`itens.${index}.precoUnitario`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Preço Unitário *</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      className="pl-8 text-right"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="lg:col-span-3">
                          <div className="flex flex-col h-full">
                            <label className="text-sm font-medium mb-2">Total do Item</label>
                            <div className="px-3 py-1 border rounded-md flex items-center justify-center border-sky-600 ">
                              <span className="font-bold">
                                R$ {calculateItemTotal(form.watch(`itens.${index}`)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seção de Desconto */}
                      <div className="mt-6 pt-4 border-t border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`itens.${index}.tipoDesconto`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">Tipo de Desconto</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Sem desconto" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="nenhum">Sem Desconto</SelectItem>
                                    <SelectItem value="percentual">Percentual (%)</SelectItem>
                                    <SelectItem value="valor">Valor Fixo (R$)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Campo de desconto condicional */}
                          {form.watch(`itens.${index}.tipoDesconto`) === "percentual" && (
                            <FormField
                              control={form.control}
                              name={`itens.${index}.descontoPercentual`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Desconto (%)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder="0.00"
                                        className="pl-8 text-right"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {form.watch(`itens.${index}.tipoDesconto`) === "valor" && (
                            <FormField
                              control={form.control}
                              name={`itens.${index}.descontoValor`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">Desconto (R$)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="pl-8 text-right"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {/* Informação sobre o desconto */}
                          {form.watch(`itens.${index}.tipoDesconto`) !== "nenhum" && (
                            <>
                              {form.watch(`itens.${index}.tipoDesconto`) === "percentual" && (
                                <div>
                                  <div className="flex flex-col h-full">
                                    <label className="text-sm font-medium mb-2">Total do Desconto</label>
                                    <div className="px-3 py-1 border rounded-md flex items-center justify-center border-amber-600 ">
                                      <span className="font-bold">
                                        -R$ {(form.watch(`itens.${index}.quantidade`) * form.watch(`itens.${index}.precoUnitario`) * (form.watch(`itens.${index}.descontoPercentual`) || 0) / 100).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {form.watch(`itens.${index}.tipoDesconto`) === "valor" && (
                                <div>
                                  <div className="flex flex-col h-full">
                                    <label className="text-sm font-medium mb-2">Total do Desconto</label>
                                    <div className="px-3 py-1 border rounded-md flex items-center justify-center border-amber-600 ">
                                      <span className="font-bold">
                                        -R$ {(form.watch(`itens.${index}.descontoValor`) || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seção de Observações */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <FileText className="h-5 w-5 text-primary" />
                  <DialogTitle>Observações</DialogTitle>
                </div>

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais sobre o orçamento..."
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seção de Resumo do Orçamento */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b">
                  <Calculator className="h-5 w-5 text-primary" />
                  <DialogTitle>Resumo do Orçamento</DialogTitle>
                </div>

                <div className="border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Subtotal ({fields.length} {fields.length === 1 ? 'item' : 'itens'})</div>
                      <div className="text-muted-foreground text-sm">Soma dos itens sem desconto</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        R$ {calculateSubtotal().toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {calculateDescontoTotal() > 0 && (
                    <>
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-amber-600">Total de Descontos</div>
                            <div className="text-muted-foreground text-sm">Desconto aplicado aos itens</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-amber-600">
                              -R$ {calculateDescontoTotal().toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-primary text-lg">
                              Total Final do Orçamento
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              R$ {calculateTotal().toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {calculateDescontoTotal() === 0 && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-primary text-lg">
                            Total do Orçamento
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            R$ {calculateTotal().toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                  className='border hover:text-red-600 hover:border-red-600 cursor-pointer sm:mt-4'
                >
                  Cancelar
                </Button>
                {canEdit && (
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0 sm:mt-4'
                  >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
