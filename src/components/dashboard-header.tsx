// src/components/dashboard-header.tsx
'use client';
import { Button } from '@/components/ui/button';
import { BarChart, ChevronLeft, Plus, LogOut, User as UserIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AddMealModal from './add-meal-modal';
import { useState } from 'react';
import type { MealData } from '@/types/meal';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { type UserProfile } from '@/types/user';
import SettingsModal from './settings-modal';

interface DashboardHeaderProps {
  onMealAdded: (mealData: MealData) => void;
  user: User | null;
  userProfile: UserProfile | null;
  onProfileUpdate: (updatedProfile: Partial<UserProfile>) => void;
}

export default function DashboardHeader({ onMealAdded, user, userProfile, onProfileUpdate }: DashboardHeaderProps) {
  const router = useRouter();
  const [isAddMealModalOpen, setAddMealModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const userId = user?.uid || null;
  const userName = user?.displayName || 'Usuário';

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
              {user && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <UserIcon className="h-5 w-5 text-primary" />
                    <span>Olá, {userName}!</span>
                </div>
              )}
            <Button variant="ghost" size="icon" onClick={() => setSettingsModalOpen(true)} disabled={!userId}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Definir Metas</span>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
            <Button onClick={() => setAddMealModalOpen(true)} disabled={!userId}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Refeição
            </Button>
          </div>
        </div>
      </header>
      <AddMealModal isOpen={isAddMealModalOpen} onOpenChange={setAddMealModalOpen} onMealAdded={onMealAdded} userId={userId} />
      {userProfile && userId && (
         <SettingsModal
            isOpen={isSettingsModalOpen}
            onOpenChange={setSettingsModalOpen}
            userProfile={userProfile}
            userId={userId}
            onProfileUpdate={onProfileUpdate}
         />
      )}
    </>
  );
}
