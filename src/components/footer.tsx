import { Leaf, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col items-start gap-4 md:col-span-1">
             <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="text-2xl font-bold">NutriSmart</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Nutrição inteligente para uma vida saudável.
            </p>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Produto</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary">Funcionalidades</Link></li>
              <li><Link href="#pricing" className="text-muted-foreground hover:text-primary">Planos</Link></li>
              <li><Link href="#testimonials" className="text-muted-foreground hover:text-primary">Depoimentos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Empresa</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Sobre Nós</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contato</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Carreiras</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Termos de Serviço</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} NutriSmart. Todos os direitos reservados.
            </p>
            <div className="mt-4 flex items-center gap-4 sm:mt-0">
                <Link href="#" aria-label="Twitter">
                    <Twitter className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
                </Link>
                <Link href="#" aria-label="Instagram">
                    <Instagram className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
                </Link>
                <Link href="#" aria-label="Facebook">
                    <Facebook className="h-5 w-5 text-muted-foreground transition-colors hover:text-primary" />
                </Link>
            </div>
        </div>
      </div>
    </footer>
  );
}
