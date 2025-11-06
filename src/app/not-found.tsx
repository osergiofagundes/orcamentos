"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Número 404 grande e estilizado */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] lg:text-[250px] font-extrabold text-gray-200 dark:text-gray-800 leading-none select-none">
            404
          </h1>
        </div>

        {/* Mensagem de erro */}
        <div className="space-y-4 px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Página não encontrada
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Desculpe, não conseguimos encontrar a página que você está procurando. 
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            <Link href="/" className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 cursor-pointer">
              <Home className="w-5 h-5" />
              Voltar para Home
            </Link>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[200px] border hover:text-red-600 hover:border-red-600 cursor-pointer"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" / >
            Página Anterior
          </Button>
        </div>
      </div>
    </div>
  );
}
