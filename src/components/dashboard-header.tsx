// src/components/dashboard-header.tsx
'use client';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { BarChart, ChevronLeft, Plus, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AddMealModal from './add-meal-modal';
import { useState } from 'react';
import type { MealData } from '@/types/meal';

interface DashboardHeaderProps {
  onMealAdded: (mealData: MealData[]) => void;
}

export default function DashboardHeader({ onMealAdded }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full" asChild>
                  <Link href="/">
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Voltar para a página inicial</span>
                  </Link>
              </Button>
              <div className="flex items-center gap-2">
                  <BarChart className="h-7 w-7 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">NutriSmart Dashboard</h1>
              </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>1.247 usuários online</span>
              </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Refeição
            </Button>
          </div>
        </div>
      </header>
      <AddMealModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} onMealAdded={onMealAdded} />
    </>
  );
}
