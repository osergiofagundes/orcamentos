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
import { Plus, Trash2, Package, User, Calculator, Search, X, FileText, AlertCircle, Loader2, ClipboardPen } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

const createOrcamentoSchema = z.object({
  clienteId: z.string().min(1, "Selecione um cliente"),
  observacoes: z.string().optional(),
  descontoGeralPercentual: z.number().min(0).max(100).optional(),
  descontoGeralValor: z.number().min(0).optional(),
  tipoDescontoGeral: z.enum(["percentual", "valor", "nenhum"]).optional(),
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
  cpf_cnpj: string | null
  telefone?: string | null
  email?: string | null
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
        (cliente.cpf_cnpj && cliente.cpf_cnpj.includes(searchTerm)) ||
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
            <div className="h-2 w-2 bg-sky-600 rounded-full"></div>
          </div>
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          type="text"
          placeholder={selectedCliente ? "Cliente selecionado - digite para alterar" : "Pesquisar cliente por nome, CPF/CNPJ, email ou telefone..."}
          className={`pr-10 ${selectedCliente ? 'pl-6 bg-sky-50 border-sky-200' : 'pl-10'}`}
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
              className="w-full px-4 py-2 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="flex flex-col space-y-1">
                <span className="font-medium text-foreground">{cliente.nome}</span>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{cliente.cpf_cnpj || 'Sem CPF/CNPJ'}</span>
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
        <div className="mt-2 p-3 bg-sky-50 border border-sky-200 rounded-md">
          <div className="text-sm">
            <div className="font-medium">{selectedCliente.nome}</div>
            <div className="flex flex-wrap gap-2 text-xs mt-1">
              <span>{selectedCliente.cpf_cnpj || 'Sem CPF/CNPJ'}</span>
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
  const [dataLoaded, setDataLoaded] = useState(false)

  const form = useForm<CreateOrcamentoForm>({
    resolver: zodResolver(createOrcamentoSchema),
    defaultValues: {
      clienteId: "",
      observacoes: "",
      descontoGeralPercentual: 0,
      descontoGeralValor: 0,
      tipoDescontoGeral: "nenhum",
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
      
      setDataLoaded(true)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados")
      setDataLoaded(true)
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

  const calculateDescontoGeral = () => {
    // Calcular subtotal após descontos dos itens
    const subtotal = calculateSubtotal()
    const descontoItens = calculateDescontoTotal()
    const subtotalComDescontos = subtotal - descontoItens
    
    const tipoDescontoGeral = form.watch("tipoDescontoGeral")
    const descontoGeralPercentual = form.watch("descontoGeralPercentual") || 0
    const descontoGeralValor = form.watch("descontoGeralValor") || 0

    if (tipoDescontoGeral === "percentual" && descontoGeralPercentual > 0) {
      return subtotalComDescontos * (descontoGeralPercentual / 100)
    } else if (tipoDescontoGeral === "valor" && descontoGeralValor > 0) {
      return descontoGeralValor
    }
    
    return 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const descontoItens = calculateDescontoTotal()
    const descontoGeral = calculateDescontoGeral()
    return Math.max(0, subtotal - descontoItens - descontoGeral)
  }



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer">
          Novo Orçamento
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl border-l-8 border-l-sky-600 rounded-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-left">Criar Novo Orçamento</DialogTitle>
          <DialogDescription className="text-left">
            Preencha as informações para criar um novo orçamento para seu cliente.
          </DialogDescription>
        </DialogHeader>
        {!dataLoaded ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : clientes.length === 0 || produtosServicos.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-sky-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados necessários não encontrados</h3>
            <div className="space-y-2 text-muted-foreground">
              {clientes.length === 0 && (
                <p>• Você precisa cadastrar pelo menos um cliente antes de criar um orçamento.</p>
              )}
              {produtosServicos.length === 0 && (
                <p>• Você precisa cadastrar pelo menos um produto/serviço antes de criar um orçamento.</p>
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
                  <DialogTitle>Escolha o Cliente</DialogTitle>
                </div>
              <FormField
                control={form.control}
                name="clienteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
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

            {/* Seção de Itens do Orçamento */}
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <DialogTitle>Escolha o Produto/Serviço</DialogTitle>
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
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-11 w-full">
                                    <SelectValue placeholder="Selecione um produto/serviço" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            {/* Seção de Desconto Geral */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Calculator className="h-5 w-5" />
                <DialogTitle>Desconto Geral no Orçamento</DialogTitle>
              </div>

              <div className="bg-muted/30 border rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Aplique um desconto adicional sobre o subtotal do orçamento.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="tipoDescontoGeral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Tipo de Desconto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-white">
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

                  {form.watch("tipoDescontoGeral") === "percentual" && (
                    <FormField
                      control={form.control}
                      name="descontoGeralPercentual"
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
                                className="pl-8 text-right bg-white"
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

                  {form.watch("tipoDescontoGeral") === "valor" && (
                    <FormField
                      control={form.control}
                      name="descontoGeralValor"
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
                                className="pl-8 text-right bg-white"
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

                  {form.watch("tipoDescontoGeral") !== "nenhum" && (
                    <>
                      {form.watch("tipoDescontoGeral") === "percentual" && (
                        <div>
                          <div className="flex flex-col h-full">
                            <label className="text-sm font-medium mb-2">Valor do Desconto Geral</label>
                            <div className="px-3 py-1 border rounded-md flex items-center justify-center border-amber-600 bg-white">
                              <span className="font-bold">
                                -R$ {((calculateSubtotal() - calculateDescontoTotal()) * (form.watch("descontoGeralPercentual") || 0) / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {form.watch("tipoDescontoGeral") === "valor" && (
                        <div>
                          <div className="flex flex-col h-full">
                            <label className="text-sm font-medium mb-2">Valor do Desconto Geral</label>
                            <div className="px-3 py-1 border rounded-md flex items-center justify-center border-amber-600 bg-white">
                              <span className="font-bold">
                                -R$ {(form.watch("descontoGeralValor") || 0).toFixed(2)}
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

            {/* Seção de Resumo do Orçamento */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b">
                <ClipboardPen className="h-5 w-5 text-primary" />
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
                          <div className="font-medium text-amber-600">Descontos nos Itens</div>
                          <div className="text-muted-foreground text-sm">Desconto aplicado aos itens individuais</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-amber-600">
                            -R$ {calculateDescontoTotal().toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Subtotal com Descontos</div>
                          <div className="text-muted-foreground text-sm">Após descontos dos itens</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">
                            R$ {(calculateSubtotal() - calculateDescontoTotal()).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {calculateDescontoGeral() > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-amber-600">Desconto Geral</div>
                        <div className="text-muted-foreground text-sm">Aplicado sobre o subtotal com descontos</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-amber-600">
                          -R$ {calculateDescontoGeral().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(calculateDescontoTotal() > 0 || calculateDescontoGeral() > 0) && (
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
                )}

                {calculateDescontoTotal() === 0 && calculateDescontoGeral() === 0 && (
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
                onClick={() => setOpen(false)}
                disabled={loading}
                className='border hover:text-red-600 hover:border-red-600 cursor-pointer sm:mt-4'
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || fields.length === 0}
                className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0 sm:mt-4'
              >
                {loading ? (<>Criando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Criar orçamento <Plus className="h-4 w-4" /></>)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
