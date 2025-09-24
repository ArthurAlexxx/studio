import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-secondary/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start gap-4">
             <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold">NutriSmart</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nutrição inteligente para uma vida saudável.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="mb-4 font-semibold">Produto</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-muted-foreground hover:text-primary">Funcionalidades</Link></li>
                <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Empresa</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Sobre Nós</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Carreiras</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Termos de Serviço</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
              </ul>
            </div>
          </div>
           <div>
              <h3 className="mb-4 font-semibold">Fale Conosco</h3>
              <p className="text-sm text-muted-foreground">contato@nutrismart.com</p>
           </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} NutriSmart. Todos os direitos reservados.
            </p>
        </div>
      </div>
    </footer>
  );
}
