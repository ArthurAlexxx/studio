// src/components/header.tsx
'use client';

import { Leaf, Menu, LogOut, User as UserIcon, ChevronDown, BarChart3, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode, onClick?: () => void }) => (
  <Link
    href={href}
    onClick={onClick}
    className="font-medium text-muted-foreground transition-colors hover:text-primary text-lg md:text-base"
  >
    {children}
  </Link>
);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        unsubscribe();
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setSheetOpen(false);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const userName = user?.displayName?.split(' ')[0] || 'Usuário';

  const navLinks = (
    <>
      <NavLink href="/#features" onClick={() => setSheetOpen(false)}>Funcionalidades</NavLink>
      {user && <NavLink href="/dashboard" onClick={() => setSheetOpen(false)}>Dashboard</NavLink>}
    </>
  );

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all ${isScrolled ? 'border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm' : 'border-transparent bg-background'}`}>
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold">NutriSmart</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks}
        </nav>
        <div className="flex items-center gap-2">
          {!loading && (
            <div className='hidden md:flex items-center gap-2'>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
                        <UserIcon className="h-5 w-5 text-primary" />
                        <span>Olá, {userName}!</span>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                       <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Meu Dashboard</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => router.push('/history')}>
                      <History className="mr-2 h-4 w-4" />
                      <span>Meu Histórico</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                     <Link href="/register">Começar Agora</Link>
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="mt-8 grid gap-6">
                  {navLinks}
                  <Separator className='my-2' />
                  {!loading && (
                    <>
                      {user ? (
                         <div className='grid gap-4'>
                            <p className='font-medium text-muted-foreground'>Olá, {userName}!</p>
                            <Button variant="ghost" className='justify-start' onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </Button>
                         </div>
                      ) : (
                         <div className='grid gap-4'>
                             <Button variant="outline" asChild>
                                <Link href="/login" onClick={() => setSheetOpen(false)}>Login</Link>
                             </Button>
                             <Button asChild>
                                <Link href="/register" onClick={() => setSheetOpen(false)}>Começar Agora</Link>
                             </Button>
                         </div>
                      )}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
