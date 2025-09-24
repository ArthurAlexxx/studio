// src/components/dashboard-header.tsx
'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart3, Plus, LogOut, User as UserIcon, Settings, Leaf, ChevronDown, History } from 'lucide-react';
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
  const userName = userProfile?.fullName.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Usuário';

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
              <Leaf className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
              <h1 className="text-xl md:text-2xl font-bold text-foreground">NutriSmart</h1>
          </Link>
          
          <div className="flex items-center gap-4">
              {user && (
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
                    <DropdownMenuItem onClick={() => setSettingsModalOpen(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Definir Metas</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            
            <Button onClick={() => setAddMealModalOpen(true)} disabled={!userId} className="shadow-sm">
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
