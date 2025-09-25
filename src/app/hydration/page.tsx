// src/app/hydration/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types/user';
import type { HydrationEntry } from '@/types/hydration';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import WaterTrackerCard from '@/components/water-tracker-card';
import AppLayout from '@/components/app-layout';

// Função para obter data local no formato YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
    return format(date, 'yyyy-MM-dd');
}

export default function HydrationPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayHydration, setTodayHydration] = useState<HydrationEntry | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfile };
    });
  }, []);

  const handleWaterUpdate = useCallback(async (newWaterIntake: number) => {
    if (!user || !todayHydration) return;
    
    const updatedIntake = Math.max(0, newWaterIntake);
    const todayDocRef = doc(db, 'hydration_entries', todayHydration.id);

    try {
      await updateDoc(todayDocRef, { intake: updatedIntake });
    } catch (error: any) {
      console.error("Failed to update water intake:", error);
      toast({
        title: "Erro ao atualizar hidratação",
        description: "Não foi possível salvar seu consumo de água.",
        variant: "destructive"
      });
    }
  }, [user, todayHydration, toast]);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);

        const profileUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          }
        });

        const todayStr = getLocalDateString();
        const todayDocId = `${currentUser.uid}_${todayStr}`;
        const todayDocRef = doc(db, 'hydration_entries', todayDocId);

        const hydrationUnsubscribe = onSnapshot(todayDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setTodayHydration({ id: docSnap.id, ...docSnap.data() } as HydrationEntry);
            } else {
                const newEntry: Omit<HydrationEntry, 'id'> = {
                    userId: currentUser.uid,
                    date: todayStr,
                    intake: 0,
                    goal: userProfile?.waterGoal || 2000,
                };
                setDoc(todayDocRef, newEntry);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching today's hydration:", error);
            setLoading(false);
        });

        return () => {
          profileUnsubscribe();
          hydrationUnsubscribe();
        };

      } else {
        setUser(null);
        setUserProfile(null);
        setTodayHydration(null);
        router.push('/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router, userProfile?.waterGoal]);

  if (loading || !userProfile || !todayHydration) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão e carregando dados...</p>
      </div>
    );
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
            <p className="text-muted-foreground">Acompanhe seu consumo de água diário.</p>
        </div>
        <div className="flex justify-center">
            <div className="w-full max-w-md">
                 <WaterTrackerCard
                    waterIntake={todayHydration.intake}
                    waterGoal={todayHydration.goal}
                    onWaterUpdate={handleWaterUpdate}
                />
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
