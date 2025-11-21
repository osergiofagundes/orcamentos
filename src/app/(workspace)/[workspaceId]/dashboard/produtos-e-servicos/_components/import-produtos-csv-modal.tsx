"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { parseProdutosCSV } from "@/lib/csv-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImportProdutosCSVModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  onImportSuccess: () => void
}

interface ImportResult {
  success: number
  errors: string[]
  total: number
}

export function ImportProdutosCSVModal({
  isOpen,
  onClose,
  workspaceId,
  onImportSuccess,
}: ImportProdutosCSVModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido')
        return
      }
      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo CSV')
      return
    }

    setLoading(true)
    setImportResult(null)

    try {
      const fileContent = await file.text()
      const produtos = parseProdutosCSV(fileContent)

      if (produtos.length === 0) {
        toast.error('Nenhum produto válido encontrado no arquivo')
        setLoading(false)
        return
      }

      // Envia para a API
      const response = await fetch(`/api/workspace/${workspaceId}/produtos/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ produtos }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar produtos')
      }

      setImportResult({
        success: data.success || 0,
        errors: data.errors || [],
        total: produtos.length,
      })

      if (data.success > 0) {
        toast.success(`${data.success} produto(s) importado(s) com sucesso!`)
        onImportSuccess()
      }

      if (data.errors && data.errors.length > 0) {
        toast.warning(`${data.errors.length} produto(s) não puderam ser importados`)
      }
    } catch (error: any) {
      console.error('Erro ao importar CSV:', error)
      toast.error(error.message || 'Erro ao importar arquivo CSV')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Produtos e Serviços via CSV</DialogTitle>
          <DialogDescription>
            Selecione um arquivo CSV com os dados dos produtos e serviços para importar.
            O arquivo deve seguir o formato do template disponível.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Arquivo CSV</label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input-produtos"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : 'Selecionar arquivo'}
              </Button>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {importResult && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>{importResult.success}</strong> de{" "}
                    <strong>{importResult.total}</strong> produto(s) importado(s) com sucesso.
                  </p>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-sm mb-1">Erros encontrados:</p>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-destructive">{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="text-muted-foreground">
                            ... e mais {importResult.errors.length - 5} erro(s)
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {importResult ? 'Fechar' : 'Cancelar'}
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={loading || !file}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Importar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

