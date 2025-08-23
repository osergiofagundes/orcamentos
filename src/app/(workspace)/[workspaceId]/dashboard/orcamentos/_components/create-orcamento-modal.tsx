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
  DialogTrigger,
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
import { Plus, Trash2 } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const createOrcamentoSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    produtoServicoId: z.string().min(1, "Selecione um produto/serviço"),
    quantidade: z.number().min(1, "Quantidade deve ser maior que 0"),
    precoUnitario: z.number().min(0, "Preço deve ser maior ou igual a 0"),
    descontoPercentual: z.number().min(0).max(100).optional(),
    descontoValor: z.number().min(0).optional(),
    tipoDesconto: z.enum(["percentual", "valor", "nenhum"]).optional(),
  })).min(1, "Adicione pelo menos um item"),
})

type CreateOrcamentoForm = z.infer<typeof createOrcamentoSchema>

interface Cliente {
  id: number
  nome: string
  cpf_cnpj: string
}

interface ProdutoServico {
  id: number
  nome: string
  valor: number | null
  categoria: {
    nome: string
  }
}

interface CreateOrcamentoModalProps {
  workspaceId: string
  onOrcamentoCreated: () => void
}

export function CreateOrcamentoModal({ workspaceId, onOrcamentoCreated }: CreateOrcamentoModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtosServicos, setProdutosServicos] = useState<ProdutoServico[]>([])

  const form = useForm<CreateOrcamentoForm>({
    resolver: zodResolver(createOrcamentoSchema),
    defaultValues: {
      clienteId: "",
      observacoes: "",
      itens: [{ 
        produtoServicoId: "", 
        quantidade: 1, 
        precoUnitario: 0,
        descontoPercentual: 0,
        descontoValor: 0,
        tipoDesconto: "nenhum"
      }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "itens",
  })

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, workspaceId])

  const loadData = async () => {
    try {
      const [clientesRes, produtosRes] = await Promise.all([
        fetch(`/api/workspace/${workspaceId}/clientes`),
        fetch(`/api/workspace/${workspaceId}/produtos`),
      ])

      if (clientesRes.ok) {
        const clientesData = await clientesRes.json()
        setClientes(clientesData)
      }

      if (produtosRes.ok) {
        const produtosData = await produtosRes.json()
        setProdutosServicos(produtosData)
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados")
    }
  }

  const onSubmit = async (data: CreateOrcamentoForm) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/orcamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success("Orçamento criado com sucesso!")
        setOpen(false)
        form.reset()
        onOrcamentoCreated()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erro ao criar orçamento")
      }
    } catch (error) {
      console.error("Erro ao criar orçamento:", error)
      toast.error("Erro ao criar orçamento")
    } finally {
      setLoading(false)
    }
  }

  const updatePrecoFromProduto = (index: number, produtoId: string) => {
    const produto = produtosServicos.find(p => p.id.toString() === produtoId)
    if (produto && produto.valor) {
      form.setValue(`itens.${index}.precoUnitario`, produto.valor / 100) // Convert from cents
    }
  }

  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantidade * item.precoUnitario
    let desconto = 0
    
    if (item.tipoDesconto === "percentual" && item.descontoPercentual > 0) {
      desconto = subtotal * (item.descontoPercentual / 100)
    } else if (item.tipoDesconto === "valor" && item.descontoValor > 0) {
      desconto = item.descontoValor
    }
    
    return Math.max(0, subtotal - desconto)
  }

  const calculateTotal = () => {
    const itens = form.watch("itens")
    return itens.reduce((total, item) => {
      return total + calculateItemTotal(item)
    }, 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Orçamento</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo orçamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome} - {cliente.cpf_cnpj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Itens do Orçamento</h3>
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
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-4">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.produtoServicoId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produto/Serviço</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value)
                                updatePrecoFromProduto(index, value)
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um produto/serviço" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {produtosServicos.map((produto) => (
                                  <SelectItem key={produto.id} value={produto.id.toString()}>
                                    {produto.nome} - {produto.categoria.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.quantidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.precoUnitario`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Unitário (R$)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`itens.${index}.tipoDesconto`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Desconto</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Tipo" />
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
                    </div>

                    <div className="col-span-2 flex justify-between items-center">
                      <div className="text-sm font-medium">
                        Total: R$ {calculateItemTotal(form.watch(`itens.${index}`)).toFixed(2)}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Campos de desconto condicionais */}
                  {form.watch(`itens.${index}.tipoDesconto`) === "percentual" && (
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`itens.${index}.descontoPercentual`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Desconto (%)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-9 flex items-end pb-2">
                        <span className="text-sm text-muted-foreground">
                          Desconto de R$ {(form.watch(`itens.${index}.quantidade`) * form.watch(`itens.${index}.precoUnitario`) * (form.watch(`itens.${index}.descontoPercentual`) || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {form.watch(`itens.${index}.tipoDesconto`) === "valor" && (
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`itens.${index}.descontoValor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Desconto (R$)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-9 flex items-end pb-2">
                        <span className="text-sm text-muted-foreground">
                          Valor com desconto: R$ {Math.max(0, (form.watch(`itens.${index}.quantidade`) * form.watch(`itens.${index}.precoUnitario`)) - (form.watch(`itens.${index}.descontoValor`) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais sobre o orçamento..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-lg font-semibold">Total do Orçamento:</span>
              <span className="text-lg font-bold">R$ {calculateTotal().toFixed(2)}</span>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Orçamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
