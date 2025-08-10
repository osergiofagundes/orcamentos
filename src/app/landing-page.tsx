import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-8 py-4 border-b">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <div className="space-x-4">
          <Link href="/workspace-management">
            <Button variant="outline">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button>Registrar</Button>
          </Link>
        </div>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold mb-4">Bem-vindo ao Orçamentos</h2>
        <p className="text-lg text-gray-600 mb-8">Gerencie seus orçamentos de forma simples e eficiente.</p>
        <div className="space-x-4">
          <Link href="/signup">
            <Button size="lg">Comece agora</Button>
          </Link>
          <Link href="/signin">
            <Button size="lg" variant="outline">Já tenho conta</Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
