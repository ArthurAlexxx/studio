// src/components/dashboard-header.tsx
'use client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
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
  showAddMealButton?: boolean;
}

export default function DashboardHeader({ onMealAdded, user, userProfile, onProfileUpdate, showAddMealButton = false }: DashboardHeaderProps) {
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
      <div className="flex items-center gap-4">
        {showAddMealButton && (
           <>
            <Button onClick={() => setAddMealModalOpen(true)} disabled={!userId} className="shadow-sm hidden sm:flex">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Refeição
            </Button>
             <Button onClick={() => setAddMealModalOpen(true)} disabled={!userId} size="icon" className="shadow-sm flex sm:hidden">
              <Plus className="h-5 w-5" />
            </Button>
           </>
        )}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <p className='font-semibold'>Olá, {userName}!</p>
                    <p className='text-xs font-normal text-muted-foreground'>{user.email}</p>
                </DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsModalOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Definir Metas</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-50/80">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

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
