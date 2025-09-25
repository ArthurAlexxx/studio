// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MealEntry } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import DashboardMetrics from '@/components/dashboard-metrics';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, doc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import AppLayout from '@/components/app-layout';

export default function DashboardPage() {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [areMealsLoaded, setAreMealsLoaded] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleMealAdded = useCallback(() => {
    // A lógica de atualização agora é tratada pelo onSnapshot
    toast({
        title: 'Refeição Adicionada! ✅',
        description: 'Sua refeição foi registrada com sucesso.',
    });
  }, [toast]);

  const handleMealDeleted = useCallback(async (entryId: string) => {
    if (!entryId) {
        toast({ title: "Erro", description: "ID da refeição não encontrado.", variant: "destructive" });
        return;
    }
    try {
        await deleteDoc(doc(db, "meal_entries", entryId));
        toast({
            title: "Refeição Removida",
            description: "A refeição foi removida com sucesso."
        });
    } catch(error: any) {
        toast({
            title: "Erro ao remover refeição",
            description: error.message || "Não foi possível remover a refeição.",
            variant: "destructive"
        });
    }
  }, [toast]);

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfile };
    });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data() as UserProfile);
            } else {
                setUserProfile(null);
            }
             if (!isProfileLoaded) setIsProfileLoaded(true);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            toast({
                title: "Erro ao carregar perfil",
                description: "Não foi possível buscar seu perfil em tempo real.",
                variant: "destructive"
            });
             if (!isProfileLoaded) setIsProfileLoaded(true);
        });

        // --- Setup Real-time Listener for Meals ---
        const todayStr = new Date().toISOString().split('T')[0];
        const q = query(
          collection(db, "meal_entries"),
          where("userId", "==", currentUser.uid),
          where("date", "==", todayStr)
        );
        
        const unsubscribeMeals = onSnapshot(q, (querySnapshot) => {
            const loadedEntries = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<MealEntry, 'id'>)
            }));
            setMealEntries(loadedEntries);
            if(!areMealsLoaded) setAreMealsLoaded(true);
        }, (error) => {
            console.error("Error fetching meals in real-time:", error);
            toast({
              title: "Erro ao carregar refeições",
              description: "Não foi possível buscar suas refeições em tempo real.",
              variant: "destructive"
            });
            if(!areMealsLoaded) setAreMealsLoaded(true);
        });
        
        return () => {
            unsubscribeProfile();
            unsubscribeMeals();
        };

      } else {
        setUser(null);
        setMealEntries([]);
        setUserProfile(null);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router, toast, isProfileLoaded, areMealsLoaded]);

  useEffect(() => {
    if (isProfileLoaded && areMealsLoaded) {
      setLoading(false);
    }
  }, [isProfileLoaded, areMealsLoaded]);
  
  const initialLoading = loading || !user || !userProfile;

  if (initialLoading) {
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
  
  const mealsToday = mealEntries.map(entry => entry.mealData);

  return (
    <AppLayout
        user={user}
        userProfile={userProfile}
        onMealAdded={handleMealAdded}
        onProfileUpdate={handleProfileUpdate}
    >
        <div className="container mx-auto py-8 px-4 sm:px-6 md:px-8">
            <DashboardMetrics meals={mealsToday} userProfile={userProfile} />
            <div className="mt-8">
              <ConsumedFoodsList 
                mealEntries={mealEntries} 
                onMealDeleted={handleMealDeleted}
              />
            </div>
        </div>
    </AppLayout>
  );
}
