'use client';

import { Leaf, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React from 'react';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="font-medium text-muted-foreground transition-colors hover:text-primary"
  >
    {children}
  </Link>
);

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = (
    <>
      <NavLink href="/#features">Funcionalidades</NavLink>
      <NavLink href="/dashboard">Dashboard</NavLink>
    </>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors ${isScrolled ? 'border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60' : 'border-transparent bg-background'}`}>
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">NutriSmart</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks}
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className='hidden md:inline-flex' asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Meu Dashboard</Link>
          </Button>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="mt-8 grid gap-6 text-lg">
                  {navLinks}
                   <Button variant="ghost" asChild>
                      <Link href="/login">Login</Link>
                   </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
