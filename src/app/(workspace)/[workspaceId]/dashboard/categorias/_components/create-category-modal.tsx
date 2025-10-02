"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"

const categorySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CreateCategoryModalProps {
  workspaceId: string
  onCategoryCreated: () => void
}

export function CreateCategoryModal({ workspaceId, onCategoryCreated }: CreateCategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: "",
    },
  })

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/categorias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao criar categoria")
      }

      toast.success("Categoria criada com sucesso!")
      form.reset()
      setIsOpen(false)
      onCategoryCreated()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar categoria")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer">
          Nova Categoria
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-left">Nova Categoria</DialogTitle>
          <DialogDescription className="text-left">
            Crie uma nova categoria para organizar seus produtos e serviços.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Consultoria, Produtos, Serviços..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className='border hover:text-red-600 hover:border-red-600 cursor-pointer sm:mt-4'>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0 sm:mt-4'>
                {isLoading ? "Criando..." : "Criar Categoria"}
                <Plus className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
