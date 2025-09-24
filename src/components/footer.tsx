import { Leaf, Twitter, Instagram, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-card text-card-foreground">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Leaf className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} NutriSmart. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex items-center gap-4">
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
    </footer>
  );
}
