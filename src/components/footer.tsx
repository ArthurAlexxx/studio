import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { Input } from './ui/input';
import { Button } from './ui/button';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary/50">
      <div className="container py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          
          <div className="flex flex-col items-start gap-4 md:col-span-3">
             <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold">NutriSmart</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nutrição inteligente para uma vida saudável.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-4">
            <div>
              <h3 className="mb-4 font-semibold">Produto</h3>
              <ul className="space-y-3">
                <li><Link href="#features" className="text-muted-foreground hover:text-primary">Funcionalidades</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
                <li><Link href="/register" className="text-muted-foreground hover:text-primary">Preços</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Empresa</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Sobre Nós</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Carreiras</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Termos de Serviço</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>

           <div className="md:col-span-5">
              <h3 className="mb-4 font-semibold">Fique por dentro</h3>
              <p className="mb-4 text-sm text-muted-foreground">Receba dicas de nutrição, receitas e novidades do produto diretamente no seu e-mail.</p>
              <form className="flex w-full max-w-sm items-center space-x-2">
                <Input type="email" placeholder="seu@email.com" className="bg-background" />
                <Button type="submit">Inscrever</Button>
              </form>
           </div>
        </div>
        <div className="mt-16 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} NutriSmart. Todos os direitos reservados.
            </p>
        </div>
      </div>
    </footer>
  );
}
