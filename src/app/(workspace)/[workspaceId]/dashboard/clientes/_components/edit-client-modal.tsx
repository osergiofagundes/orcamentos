"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { formatCpfCnpj, formatPhone, formatCep, validateCpfCnpj } from "@/lib/formatters"
import { ESTADOS_BRASILEIROS } from "@/lib/constants"
import { Edit } from "lucide-react"

const clientSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf_cnpj: z.string().optional().or(z.literal('')).refine((value) => {
    if (!value || value === '') return true
    return validateCpfCnpj(value)
  }, {
    message: "CPF/CNPJ inválido"
  }),
  telefone: z.string().optional().or(z.literal('')),
  email: z.string().optional().or(z.literal('')).refine((value) => {
    if (!value || value === '') return true
    return z.string().email().safeParse(value).success
  }, {
    message: "Email inválido"
  }),
  endereco: z.string().optional().or(z.literal('')),
  bairro: z.string().optional().or(z.literal('')),
  cidade: z.string().optional().or(z.literal('')),
  estado: z.string().optional().or(z.literal('')),
  cep: z.string().optional().or(z.literal('')),
})

type ClientFormData = z.infer<typeof clientSchema>

interface Client {
  id: number
  nome: string
  cpf_cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
}

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client
  workspaceId: string
  onSuccess?: () => void
}

export function EditClientModal({ isOpen, onClose, client, workspaceId, onSuccess }: EditClientModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome: client.nome,
      cpf_cnpj: client.cpf_cnpj || "",
      telefone: client.telefone || "",
      email: client.email || "",
      endereco: client.endereco || "",
      bairro: client.bairro || "",
      cidade: client.cidade || "",
      estado: client.estado || "",
      cep: client.cep || "",
    },
  })

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/clientes/${client.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao atualizar cliente")
      }

      toast.success("Cliente atualizado com sucesso!")
      onClose()
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-left">Editar Cliente</DialogTitle>
          <DialogDescription className="text-left">
            Atualize as informações do cliente.
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
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf_cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF/CNPJ</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="000.000.000-00 ou 00.000.000/0000-00" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCpfCnpj(e.target.value)
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
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value)
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cliente@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Rua, Número, Complemento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bairro"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Cidade"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((estado) => (
                          <SelectItem key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
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
                name="cep"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value)
                          field.onChange(formatted)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className='border hover:text-red-600 hover:border-red-600 cursor-pointer sm:mt-4'>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0 sm:mt-4'>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
                <Edit className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
