// src/app/hydration/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import WaterTrackerCard from '@/components/water-tracker-card';
import AppLayout from '@/components/app-layout';

export default function HydrationPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfile };
    });
  }, []);

  const handleWaterUpdate = useCallback(async (newWaterIntake: number) => {
    if (!user || !userProfile) return;

    const updatedIntake = Math.max(0, newWaterIntake);
    const originalIntake = userProfile.waterIntake;

    // Optimistic update
    setUserProfile(prev => prev ? { ...prev, waterIntake: updatedIntake } : null);
    
    try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { waterIntake: updatedIntake });
    } catch (error: any) {
        console.error("Failed to update water intake:", error);
        toast({
            title: "Erro ao atualizar hidratação",
            description: "Não foi possível salvar seu consumo de água.",
            variant: "destructive"
        });
        // Reverter o estado local em caso de erro
        setUserProfile(prev => prev ? { ...prev, waterIntake: originalIntake } : null);
    }
  }, [user, userProfile, toast]);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
          let profileData: UserProfile;
          let updates: Partial<UserProfile> = {};

          if (userDoc.exists()) {
            profileData = userDoc.data() as UserProfile;
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = profileData.lastLoginDate;

            if (profileData.waterIntake === undefined) {
                updates.waterIntake = 0;
            }
            if (profileData.waterGoal === undefined) {
                updates.waterGoal = 2000;
            }

            if (lastLogin !== today) {
              updates.waterIntake = 0; 
              
              if (lastLogin && differenceInCalendarDays(new Date(), parseISO(lastLogin)) === 1) {
                updates.currentStreak = (profileData.currentStreak || 0) + 1;
              } else if (lastLogin) { 
                updates.currentStreak = 1;
              } else {
                 updates.currentStreak = 1;
              }
              updates.lastLoginDate = today;
            }
             
            if (Object.keys(updates).length > 0) {
              await updateDoc(userDocRef, updates);
              setUserProfile({ ...profileData, ...updates });
            } else {
              setUserProfile(profileData);
            }

          } else { 
             profileData = {
              fullName: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              currentStreak: 1,
              lastLoginDate: new Date().toISOString().split('T')[0],
              calorieGoal: 2000,
              proteinGoal: 140,
              waterGoal: 2000,
              waterIntake: 0,
            };
            await setDoc(userDocRef, profileData);
            setUserProfile(profileData);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            toast({
                title: "Erro ao carregar perfil",
                description: "Não foi possível buscar seus dados.",
                variant: "destructive"
            });
            setLoading(false);
        });

        return () => unsubscribeProfile();

      } else {
        setUser(null);
        setUserProfile(null);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router, toast]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão e carregando dados...</p>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <AppLayout
        user={user}
        userProfile={userProfile}
        onMealAdded={() => {}}
        onProfileUpdate={handleProfileUpdate}
    >
      <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8">
        <div className="mb-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">Controle de Hidratação</h2>
            <p className="text-muted-foreground">Manter-se hidratado é essencial para sua saúde e bem-estar.</p>
        </div>
        <div className="max-w-2xl mx-auto">
             <WaterTrackerCard
                waterIntake={userProfile.waterIntake}
                waterGoal={userProfile.waterGoal}
                onWaterUpdate={handleWaterUpdate}
            />
        </div>
      </div>
    </AppLayout>
  );
}
