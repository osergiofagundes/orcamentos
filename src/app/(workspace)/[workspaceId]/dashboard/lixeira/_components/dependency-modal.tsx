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
} from "@/components/ui/dialog"
import { AlertTriangle, Trash2, Eye, X } from "lucide-react"

interface DependencyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    type: "cliente" | "orcamento" | "produto" | "categoria"
    name: string
  }
  error: {
    error: string
    message: string
    details: any
  }
  onForceDelete?: () => void
  onViewDependencies?: () => void
}

const typeLabels = {
  cliente: "cliente",
  orcamento: "orçamento",
  produto: "produto/serviço", 
  categoria: "categoria"
}

const dependencyMessages = {
  CLIENT_HAS_BUDGETS: {
    title: "Cliente possui orçamentos vinculados",
    description: "Este cliente não pode ser excluído pois possui orçamentos associados.",
    suggestion: "Para excluir este cliente, você pode:"
  },
  PRODUCT_HAS_BUDGET_ITEMS: {
    title: "Produto está sendo usado em orçamentos",
    description: "Este produto/serviço não pode ser excluído pois está sendo usado em itens de orçamento.",
    suggestion: "Para excluir este produto, você pode:"
  },
  CATEGORY_HAS_PRODUCTS: {
    title: "Categoria possui produtos vinculados",
    description: "Esta categoria não pode ser excluída pois possui produtos/serviços associados.",
    suggestion: "Para excluir esta categoria, você pode:"
  }
}

export function DependencyModal({
  open,
  onOpenChange,
  item,
  error,
  onForceDelete,
  onViewDependencies
}: DependencyModalProps) {
  const [showForceOptions, setShowForceOptions] = useState(false)
  
  const config = dependencyMessages[error.error as keyof typeof dependencyMessages]
  
  if (!config) {
    return null
  }

  const renderDependencyInfo = () => {
    switch (error.error) {
      case 'CLIENT_HAS_BUDGETS':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Total de orçamentos:</span> {error.details.totalBudgets}
            </div>
            {error.details.activeBudgets > 0 && (
              <div className="text-sm text-red-600">
                • {error.details.activeBudgets} orçamento(s) ativo(s)
              </div>
            )}
            {error.details.deletedBudgets > 0 && (
              <div className="text-sm text-gray-500">
                • {error.details.deletedBudgets} orçamento(s) já excluído(s)
              </div>
            )}
          </div>
        )
      case 'PRODUCT_HAS_BUDGET_ITEMS':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Usado em:</span> {error.details.budgetItems} item(ns) de orçamento
            </div>
          </div>
        )
      case 'CATEGORY_HAS_PRODUCTS':
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Total de produtos:</span> {error.details.totalProducts}
            </div>
            {error.details.activeProducts > 0 && (
              <div className="text-sm text-blue-600">
                • {error.details.activeProducts} produto(s) ativo(s)
              </div>
            )}
            {error.details.deletedProducts > 0 && (
              <div className="text-sm text-gray-500">
                • {error.details.deletedProducts} produto(s) já excluído(s)
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-l-8 border-l-red-800">
        <DialogHeader>
          <DialogTitle>
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="font-medium text-red-800">
              {item.name} <span className="text-sm font-normal">({typeLabels[item.type]})</span>
            </div>
            
            {renderDependencyInfo()}
          </div>

          {!showForceOptions && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800 font-medium mb-2">
                {config.suggestion}
              </div>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Primeiro excluir os itens dependentes</li>
                <li>Ou forçar a exclusão (remove todas as dependências automaticamente)</li>
              </ul>
            </div>
          )}

          {showForceOptions && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <AlertTriangle className="h-4 w-4" />
                Exclusão Forçada
              </div>
              <div className="text-sm text-red-700 mb-3">
                A exclusão forçada irá remover automaticamente todos os itens dependentes. Esta ação é irreversível.
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForceOptions(false)}
                  className='border hover:text-red-600 hover:border-red-600 cursor-pointer'
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onForceDelete}
                  className='bg-red-600 hover:bg-red-700 cursor-pointer'
                >
                  Forçar Exclusão
                  <Trash2 className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className='border hover:text-red-600 hover:border-red-600 cursor-pointer'
          >
            Fechar
          </Button>
          
          {onViewDependencies && (
            <Button
              variant="secondary"
              onClick={onViewDependencies}
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Dependências
            </Button>
          )}
          
          {!showForceOptions && (
            <Button
              variant="destructive"
              onClick={() => setShowForceOptions(true)}
              className='bg-red-600 hover:bg-red-700 cursor-pointer'
            >
              Forçar Exclusão
              <Trash2 className="h-4 w-4 mr-1" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}