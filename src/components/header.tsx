'use client';

import { Leaf, Menu, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="font-medium text-muted-foreground transition-colors hover:text-primary"
  >
    {children}
  </Link>
);

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };
  
  const userName = user?.displayName?.split(' ')[0] || 'Usuário';

  const navLinks = (
    <>
      <NavLink href="/#features">Funcionalidades</NavLink>
      {user && <NavLink href="/dashboard">Dashboard</NavLink>}
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
          {!loading && (
            <>
              {user ? (
                <>
                   {user && (
                    <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <UserIcon className="h-5 w-5 text-primary" />
                        <span>Olá, {userName}!</span>
                    </div>
                  )}
                   <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                   </Button>
                   <Button asChild>
                     <Link href="/dashboard">Meu Dashboard</Link>
                   </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className='hidden md:inline-flex' asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                     <Link href="/register">Começar Agora</Link>
                  </Button>
                </>
              )}
            </>
          )}

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
                  {!user ? (
                     <Button variant="ghost" asChild>
                        <Link href="/login">Login</Link>
                     </Button>
                  ) : (
                     <Button variant="ghost" onClick={handleSignOut}>
                        Sair
                     </Button>
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
