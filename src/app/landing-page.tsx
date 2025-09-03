import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full border-b bg-white dark:bg-background py-4">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src="/images/logo.png" alt='Logo' />
            </Avatar>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-primary hidden xs:block">Sky Orçamentos</span>
            <span className="font-bold text-lg tracking-tight text-primary xs:hidden">Sky Orçamentos</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/workspace-management">
              <Button variant="outline" className="cursor-pointer hover:bg-transparent hover:text-sky-600 hover:border-sky-600">Entrar</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white cursor-pointer">Registrar</Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <section className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[600px]">
            {/* Conteúdo principal */}
            <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Bem-vindo ao{" "}
                <br></br>
                <span className="text-sky-600 font-bold">Sky Orçamentos</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Gerencie seus orçamentos de forma simples e eficiente. 
                <br></br>
                Crie, organize e acompanhe seus projetos com facilidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3 bg-sky-600 hover:bg-sky-700 text-white cursor-pointer">
                    Comece agora
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-3 cursor-pointer hover:bg-transparent hover:text-sky-600 hover:border-sky-600">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Imagem do mascote */}
            <div className="flex-shrink-0 lg:flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <Image
                  src="/images/mascote.png"
                  alt="Mascote Sky Orçamentos"
                  width={400}
                  height={400}
                  className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-contain"
                  priority
                />
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e descrição */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/images/logo.png" alt='Logo' />
                </Avatar>
                <span className="font-bold text-lg tracking-tight text-primary">Sky Orçamentos</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                A plataforma completa para gerenciar seus orçamentos com eficiência e profissionalismo. 
                Simplifique seu trabalho e aumente sua produtividade.
              </p>
            </div>
            
            {/* Links úteis */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Plataforma</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/signin" className="text-muted-foreground hover:text-sky-600 transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-muted-foreground hover:text-sky-600 transition-colors">
                    Registrar
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-3">Contato</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="https://www.linkedin.com/in/sergiofagundes/" target="_blank" className="text-muted-foreground hover:text-sky-600 transition-colors">
                    LinkedIn
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Linha divisória e copyright */}
          <div className="border-t pt-6 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Sky Orçamentos. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Versão 1.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
