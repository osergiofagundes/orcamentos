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
import { Plus, Trash2, Package, User, Calculator, Search, X, FileText } from "lucide-react"
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
  telefone?: string
  email?: string
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

// Componente de pesquisa de clientes
interface ClienteSearchFieldProps {
  value: string
  onChange: (value: string) => void
  clientes: Cliente[]
}

function ClienteSearchField({ value, onChange, clientes }: ClienteSearchFieldProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])

  const selectedCliente = clientes.find(c => c.id.toString() === value)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes.slice(0, 10)) // Mostra os primeiros 10 se não há busca
    } else {
      const filtered = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cpf_cnpj.includes(searchTerm) ||
        (cliente.email && cliente.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cliente.telefone && cliente.telefone.includes(searchTerm))
      ).slice(0, 10) // Limita a 10 resultados
      setFilteredClientes(filtered)
    }
  }, [searchTerm, clientes])

  const handleInputChange = (inputValue: string) => {
    setSearchTerm(inputValue)
    setIsOpen(true)
    if (inputValue.trim() === "" && !selectedCliente) {
      onChange("")
    }
    // Se já tem um cliente selecionado e o usuário começar a digitar algo diferente, limpa a seleção
    if (selectedCliente && inputValue !== selectedCliente.nome) {
      onChange("")
    }
  }

  const handleSelectCliente = (cliente: Cliente) => {
    onChange(cliente.id.toString())
    setSearchTerm(cliente.nome)
    setIsOpen(false)
  }

  const clearSelection = () => {
    onChange("")
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        {selectedCliente ? (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder={selectedCliente ? "Cliente selecionado - digite para alterar" : "Pesquisar cliente por nome, CPF/CNPJ, email ou telefone..."}
          className={`h-11 pr-10 ${selectedCliente ? 'pl-6 bg-green-50 border-green-200' : 'pl-10'}`}
          value={selectedCliente ? selectedCliente.nome : searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Pequeno delay para permitir click no dropdown
            setTimeout(() => setIsOpen(false), 200)
          }}
        />
        {(selectedCliente || searchTerm) && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isOpen && (filteredClientes.length > 0 || searchTerm.trim() !== "") && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredClientes.map((cliente) => (
            <button
              key={cliente.id}
              type="button"
              onClick={() => handleSelectCliente(cliente)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-foreground">{cliente.nome}</span>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{cliente.cpf_cnpj}</span>
                  {cliente.email && <span>• {cliente.email}</span>}
                  {cliente.telefone && <span>• {cliente.telefone}</span>}
                </div>
              </div>
            </button>
          ))}
          {searchTerm.trim() !== "" && filteredClientes.length === 0 && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              Nenhum cliente encontrado para "{searchTerm}"
            </div>
          )}
        </div>
      )}
      
      {/* Informações do cliente selecionado */}
      {selectedCliente && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm text-green-800">
            <div className="font-medium">{selectedCliente.nome}</div>
            <div className="flex flex-wrap gap-2 text-xs text-green-600 mt-1">
              <span>{selectedCliente.cpf_cnpj}</span>
              {selectedCliente.email && <span>• {selectedCliente.email}</span>}
              {selectedCliente.telefone && <span>• {selectedCliente.telefone}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
        <Button className="hover:scale-105 transition-transform">
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-primary">Criar Novo Orçamento</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Preencha as informações para criar um novo orçamento para seu cliente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Seção de Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Informações Básicas</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="clienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Cliente *</FormLabel>
                      <ClienteSearchField 
                        value={field.value}
                        onChange={field.onChange}
                        clientes={clientes}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção de Itens do Orçamento */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Itens do Orçamento</h3>
                  <span className="text-sm text-muted-foreground">({fields.length} {fields.length === 1 ? 'item' : 'itens'})</span>
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
                  className="h-9 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative bg-muted/30 border border-border rounded-xl p-6 transition-all hover:shadow-sm">
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-full">
                        Item #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
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
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Selecione um produto/serviço" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {produtosServicos.map((produto) => (
                                    <SelectItem key={produto.id} value={produto.id.toString()}>
                                      <div className="flex flex-col">
                                        <span className="font-medium">{produto.nome}</span>
                                        <span className="text-xs text-muted-foreground">{produto.categoria.nome}</span>
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
                              <FormLabel className="text-sm font-medium">Qtd *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  className="h-11 text-center"
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
                              <FormLabel className="text-sm font-medium">Preço Unit.</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="h-11 pl-8 text-right"
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
                          <div className="h-11 px-3 bg-primary/5 border border-primary/20 rounded-md flex items-center justify-center">
                            <span className="font-bold text-primary text-lg">
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10">
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
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      placeholder="0.00"
                                      className="h-10 pr-8 text-right"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
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
                                      className="h-10 pl-8 text-right"
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
                          <div className="flex flex-col h-full justify-center">
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div>Subtotal: R$ {(form.watch(`itens.${index}.quantidade`) * form.watch(`itens.${index}.precoUnitario`)).toFixed(2)}</div>
                              {form.watch(`itens.${index}.tipoDesconto`) === "percentual" && (
                                <div className="text-orange-600">
                                  Desconto: -R$ {(form.watch(`itens.${index}.quantidade`) * form.watch(`itens.${index}.precoUnitario`) * (form.watch(`itens.${index}.descontoPercentual`) || 0) / 100).toFixed(2)}
                                </div>
                              )}
                              {form.watch(`itens.${index}.tipoDesconto`) === "valor" && (
                                <div className="text-orange-600">
                                  Desconto: -R$ {(form.watch(`itens.${index}.descontoValor`) || 0).toFixed(2)}
                                </div>
                              )}
                            </div>
                          </div>
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
                <h3 className="text-lg font-semibold text-foreground">Observações</h3>
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
                <h3 className="text-lg font-semibold text-foreground">Resumo do Orçamento</h3>
              </div>
              
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total de {fields.length} {fields.length === 1 ? 'item' : 'itens'}</div>
                    <div className="text-2xl font-bold text-primary">
                      Total do Orçamento
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      R$ {calculateTotal().toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {calculateTotal() > 0 && `Média de R$ ${(calculateTotal() / fields.length).toFixed(2)} por item`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || fields.length === 0}
                className="w-full sm:w-auto min-w-[120px]"
              >
                {loading ? "Criando..." : "Criar Orçamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
