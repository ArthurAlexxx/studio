// src/components/app-layout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, History, Leaf, Settings, LogOut, Menu, Plus, User as UserIcon, ChevronDown, X, HeartPulse, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types/user';
import type { MealData } from '@/types/meal';
import DashboardHeader from './dashboard-header';
import { Separator } from './ui/separator';

interface AppLayoutProps {
  user: User | null;
  userProfile: UserProfile | null;
  onMealAdded: (mealData: MealData) => void;
  onProfileUpdate: (updatedProfile: Partial<UserProfile>) => void;
  children: React.ReactNode;
}

const navItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: BarChart3 },
  { href: '/history', label: 'Histórico', icon: History },
  { href: '/strava', label: 'Atividades', icon: HeartPulse },
  { href: '/chef', label: 'Chef Virtual', icon: ChefHat },
];

const NavLink = ({ href, label, icon: Icon, pathname }: { href: string; label: string; icon: React.ElementType; pathname: string }) => {
  const isActive = pathname === href;
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
          isActive && "bg-primary/10 text-primary font-semibold"
        )}
      >
        <Icon className="h-5 w-5" />
        {label}
      </div>
    </Link>
  );
};

export default function AppLayout({ user, userProfile, onMealAdded, onProfileUpdate, children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const showAddMealButton = pathname === '/dashboard';

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-20 items-center border-b px-4 lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="text-xl">NutriSmart</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} pathname={pathname} />
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
             <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <SheetHeader className="flex h-20 items-center border-b px-4">
                         <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Leaf className="h-7 w-7 text-primary" />
                            <span className="text-xl">NutriSmart</span>
                        </Link>
                         <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                    </SheetHeader>
                    <nav className="grid gap-2 text-lg font-medium p-4">
                         {navItems.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setSheetOpen(false)}>
                                <div
                                    className={cn(
                                    "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                                    pathname.startsWith(item.href) && "bg-muted text-foreground"
                                    )}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.label}
                                </div>
                            </Link>
                         ))}
                    </nav>
                </SheetContent>
            </Sheet>
            
            <div className="w-full flex-1">
              {/* Opcional: pode-se adicionar um breadcrumb aqui */}
            </div>

            <DashboardHeader
                onMealAdded={onMealAdded}
                user={user}
                userProfile={userProfile}
                onProfileUpdate={onProfileUpdate}
                showAddMealButton={showAddMealButton}
            />
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
