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
import { Plus, Trash2, Save } from "lucide-react"
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
  })).min(1, "Adicione pelo menos um item"),
})

type EditOrcamentoForm = z.infer<typeof editOrcamentoSchema>

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

interface OrcamentoDetalhado {
  id: number
  data_criacao: string
  valor_total: number | null
  status: string
  observacoes?: string
  cliente: {
    id: number
    nome: string
    cpf_cnpj: string
  }
  usuario: {
    name: string
  }
  itensOrcamento: {
    id: number
    quantidade: number
    preco_unitario: number
    produtoServico: {
      id: number
      nome: string
    }
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
            produtoServicoId: item.produtoServico?.id?.toString() || "",
            quantidade: item.quantidade || 1,
            precoUnitario: (item.preco_unitario || 0) / 100, // Convert from cents
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
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados")
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
    const produto = produtosServicos.find(p => p.id.toString() === produtoId)
    if (produto && produto.valor) {
      form.setValue(`itens.${index}.precoUnitario`, produto.valor / 100) // Convert from cents
    }
  }

  const calculateTotal = () => {
    const itens = form.watch("itens")
    return itens.reduce((total, item) => {
      return total + (item.quantidade * item.precoUnitario)
    }, 0)
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Orçamento #{orcamentoId}
          </DialogTitle>
          <DialogDescription>
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
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Itens do Orçamento</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ produtoServicoId: "", quantidade: 1, precoUnitario: 0 })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                    <div className="col-span-5">
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
                              value={field.value}
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

                    <div className="col-span-3">
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

                    <div className="col-span-2 flex justify-between items-center">
                      <div className="text-sm font-medium">
                        Total: R$ {(form.watch(`itens.${index}.quantidade`) * form.watch(`itens.${index}.precoUnitario`)).toFixed(2)}
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
                ))}
              </div>

              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="text-lg font-semibold">Total do Orçamento:</span>
                <span className="text-lg font-bold">R$ {calculateTotal().toFixed(2)}</span>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                {canEdit && (
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
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
