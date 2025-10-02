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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Edit, Loader2 } from "lucide-react"

const categorySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(50, "Nome deve ter no máximo 50 caracteres"),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface Category {
  id: number
  nome: string
}

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category
  workspaceId: string
}

export function EditCategoryModal({ isOpen, onClose, category, workspaceId }: EditCategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nome: category.nome,
    },
  })

  // Atualizar os valores do formulário quando a categoria mudar
  useEffect(() => {
    form.reset({
      nome: category.nome,
    })
  }, [category, form])

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspace/${workspaceId}/categorias/${category.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao atualizar categoria")
      }

      toast.success("Categoria atualizada com sucesso!")
      onClose()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar categoria")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-sky-600 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-left">Editar Categoria</DialogTitle>
          <DialogDescription className="text-left">
            Atualize as informações da categoria.
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
              <Button type="button" variant="outline" onClick={onClose} className='border hover:text-red-600 hover:border-red-600 cursor-pointer sm:mt-4'>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className='bg-sky-600 hover:bg-sky-700 cursor-pointer my-4 sm:my-0 sm:mt-4'>
                {isLoading ? (<>Salvando <Loader2 className="h-4 w-4 animate-spin" /></>) : (<>Salvar Alterações <Edit className="h-4 w-4" /></>)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
