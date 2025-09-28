import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DatabaseQuotaErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function DatabaseQuotaError({ onRetry, className }: DatabaseQuotaErrorProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Limite de Dados Atingido</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          O banco de dados atingiu o limite de transferência de dados. Algumas funcionalidades 
          podem estar limitadas até que o limite seja renovado.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar Novamente
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Atualizar Página
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}