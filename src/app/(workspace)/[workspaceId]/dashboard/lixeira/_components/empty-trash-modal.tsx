"use client"

import { useState } from "react"
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
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmptyTrashModalProps {
  workspaceId: string
  onEmptyTrash?: () => void
}

export function EmptyTrashModal({
  workspaceId,
  onEmptyTrash
}: EmptyTrashModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleEmptyTrash = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(
        `/api/workspace/${workspaceId}/lixeira/empty`,
        {
          method: "POST",
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.details || errorData.error || "Erro ao esvaziar lixeira")
      }

      const result = await response.json()

      toast.success(`Lixeira esvaziada! ${result.deletedCount} itens foram removidos permanentemente.`)

      onEmptyTrash?.()
      setOpen(false)
    } catch (error) {
      console.error("Erro ao esvaziar lixeira:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao esvaziar lixeira")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 hover:text-red-600 hover:bg-red-50 hover:border-red-600 cursor-pointer">
          <Trash2 className="h-4 w-4" />
          Esvaziar Lixeira
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <DialogTitle>
            Esvaziar Lixeira
          </DialogTitle>
          <DialogDescription>
            Esta ação é irreversível. Todos os itens deste workspace na lixeira serão removidos permanentemente e não poderão ser recuperados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className='border hover:text-red-600 hover:border-red-600 cursor-pointer'
          >
            Cancelar
          </Button>
            <Button
            variant="destructive"
            onClick={handleEmptyTrash}
            disabled={loading}
            className='bg-red-600 hover:bg-red-700 cursor-pointer'
            >
            {loading ? (
              <>
                Esvaziando
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Esvaziar Lixeira
                <Trash2 className="h-4 w-4" />
              </>
            )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}