"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

const productSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  valor: z.string().min(1, "Valor é obrigatório"),
  tipo: z.enum(["PRODUTO", "SERVICO"], {
    required_error: "Tipo é obrigatório",
  }),
  tipo_valor: z.enum(["UNIDADE", "METRO", "METRO_QUADRADO", "METRO_CUBICO", "CENTIMETRO", "DUZIA", "QUILO", "GRAMA", "QUILOMETRO", "LITRO", "MINUTO", "HORA", "DIA", "MES", "ANO"], {
    required_error: "Tipo de valor é obrigatório",
  }),
  categoria_id: z.string().min(1, "Categoria é obrigatória"),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: number
  nome: string
}

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
}

export function CreateProductModal({ isOpen, onClose, workspaceId }: CreateProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: "",
      valor: "",
      tipo: "PRODUTO",
      tipo_valor: "UNIDADE",
      categoria_id: "0",
    },
  })

  // Observar mudanças no campo tipo
  const tipoValue = form.watch("tipo")

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/categorias`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen, workspaceId])

  // Resetar tipo_valor quando tipo mudar
  useEffect(() => {
    if (tipoValue === "PRODUTO") {
      form.setValue("tipo_valor", "UNIDADE")
    } else if (tipoValue === "SERVICO") {
      form.setValue("tipo_valor", "HORA")
    }
  }, [tipoValue, form])

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")
    
    // Se não houver números, retorna vazio
    if (!numbers) return ""
    
    // Converte para formato de moeda
    const amount = parseFloat(numbers) / 100
    return amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const getTipoValorOptions = (tipo: "PRODUTO" | "SERVICO") => {
    if (tipo === "PRODUTO") {
      return [
        { value: "UNIDADE", label: "Unidades" },
        { value: "DUZIA", label: "Dúzias" },
        { value: "METRO", label: "Metros" },
        { value: "METRO_QUADRADO", label: "Metros Quadrados" },
        { value: "METRO_CUBICO", label: "Metro Cúbico" },
        { value: "CENTIMETRO", label: "Centímetros" },
        { value: "QUILOMETRO", label: "Quilômetro" },
        { value: "QUILO", label: "Quilo" },
        { value: "GRAMA", label: "Grama" },
        { value: "LITRO", label: "Litros" },
      ]
    } else {
      return [
        { value: "UNIDADE", label: "Unidades" },
        { value: "MINUTO", label: "Minutos" },
        { value: "HORA", label: "Horas" },
        { value: "DIA", label: "Dias" },
        { value: "MES", label: "Meses" },
        { value: "ANO", label: "Anos" },
      ]
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      // Converte valor para centavos
      const valorCentavos = Math.round(parseFloat(data.valor.replace(/\D/g, "")) / 100 * 100)
      
      const response = await fetch(`/api/workspace/${workspaceId}/produtos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          valor: valorCentavos,
          categoria_id: parseInt(data.categoria_id),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao criar produto/serviço")
      }

      toast.success("Produto/serviço criado com sucesso!")
      form.reset()
      onClose()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar produto/serviço")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-left">Novo Produto/Serviço</DialogTitle>
          <DialogDescription className="text-left">
            Adicione um novo produto ou serviço ao seu workspace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto/serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCurrency(e.target.value)
                        field.onChange(formatted)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRODUTO">Produto</SelectItem>
                      <SelectItem value="SERVICO">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo_valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Medida</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o tipo de valor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getTipoValorOptions(tipoValue).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Sem categoria</SelectItem>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.nome}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-categories" disabled>
                          Nenhuma categoria personalizada cadastrada
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className='border hover:text-red-600 hover:border-red-600 cursor-pointer sm:mt-4'>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0 sm:mt-4'>
                {isLoading ? (<>Criando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Criar produto/serviço <Plus className="h-4 w-4" /></>)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
