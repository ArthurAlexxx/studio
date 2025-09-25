// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MealEntry } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import type { HydrationEntry } from '@/types/hydration';
import DashboardMetrics from '@/components/dashboard-metrics';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, doc, onSnapshot, deleteDoc, updateDoc, setDoc, getDocs, limit, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import AppLayout from '@/components/app-layout';
import WaterTrackerCard from '@/components/water-tracker-card';

// Função para obter data local no formato YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
    return format(date, 'yyyy-MM-dd');
}

export default function DashboardPage() {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationEntry[]>([]);
  const [todayHydration, setTodayHydration] = useState<HydrationEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [areMealsLoaded, setAreMealsLoaded] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isHydrationLoaded, setIsHydrationLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleMealAdded = useCallback(() => {
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
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // --- PROFILE LISTENER ---
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
            if (!isProfileLoaded) setIsProfileLoaded(true);
        });

        // --- MEALS LISTENER ---
        const todayStr = getLocalDateString();
        const mealsQuery = query(
          collection(db, "meal_entries"),
          where("userId", "==", currentUser.uid),
          where("date", "==", todayStr)
        );
        const unsubscribeMeals = onSnapshot(mealsQuery, (querySnapshot) => {
            const loadedEntries = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<MealEntry, 'id'>)
            }));
            setMealEntries(loadedEntries);
            if(!areMealsLoaded) setAreMealsLoaded(true);
        }, (error) => {
            console.error("Error fetching meals in real-time:", error);
            if(!areMealsLoaded) setAreMealsLoaded(true);
        });

        // --- HYDRATION LISTENERS ---
        const todayDocId = `${currentUser.uid}_${todayStr}`;
        const todayDocRef = doc(db, 'hydration_entries', todayDocId);
        
        // Listener for today's hydration
        const unsubscribeTodayHydration = onSnapshot(todayDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as HydrationEntry;
                setTodayHydration(data);
                 // Also update history to reflect today's changes
                setHydrationHistory(prevHistory => {
                    const existingIndex = prevHistory.findIndex(h => h.id === data.id);
                    if (existingIndex > -1) {
                        const newHistory = [...prevHistory];
                        newHistory[existingIndex] = data;
                        return newHistory;
                    }
                    // Sort is handled by the weekly query now
                    return [...prevHistory, data].sort((a, b) => b.date.localeCompare(a.date));
                });

            } else {
                // Use a local variable for profile to avoid stale state
                const currentGoal = userProfile?.waterGoal || 2000;
                const newEntry: Omit<HydrationEntry, 'id'> = {
                    userId: currentUser.uid,
                    date: todayStr,
                    intake: 0,
                    goal: currentGoal,
                };
                setDoc(todayDocRef, newEntry).then(() => {
                    const newHydrationEntry = { id: todayDocId, ...newEntry };
                    setTodayHydration(newHydrationEntry);
                     setHydrationHistory(prev => [...prev, newHydrationEntry].sort((a, b) => b.date.localeCompare(a.date)));
                });
            }
        }, (error) => {
            console.error("Error fetching today's hydration:", error);
        });

        // Listener for weekly hydration history
        const sevenDaysAgo = getLocalDateString(subDays(new Date(), 6));
        const weeklyHydrationQuery = query(
          collection(db, 'hydration_entries'),
          where('userId', '==', currentUser.uid),
          where('date', '>=', sevenDaysAgo)
        );

        const unsubscribeWeeklyHydration = onSnapshot(weeklyHydrationQuery, (snapshot) => {
          const weeklyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HydrationEntry));
          // Sort manually on the client-side to avoid complex indexes
          weeklyData.sort((a, b) => b.date.localeCompare(a.date));
          setHydrationHistory(weeklyData);
          if (!isHydrationLoaded) setIsHydrationLoaded(true);
        }, (error) => {
          console.error("FirebaseError:", error.message);
          toast({
            title: "Erro ao carregar histórico de hidratação",
            description: "Não foi possível carregar os dados de hidratação. Tente mais tarde.",
            variant: "destructive"
          });
          if (!isHydrationLoaded) setIsHydrationLoaded(true);
        });
        
        return () => {
            unsubscribeProfile();
            unsubscribeMeals();
            unsubscribeTodayHydration();
            unsubscribeWeeklyHydration();
        };

      } else {
        setUser(null);
        setMealEntries([]);
        setUserProfile(null);
        setTodayHydration(null);
        setHydrationHistory([]);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router, isProfileLoaded, areMealsLoaded, isHydrationLoaded, userProfile?.waterGoal, toast]);

  useEffect(() => {
    if (isProfileLoaded && areMealsLoaded && isHydrationLoaded) {
      setLoading(false);
    }
  }, [isProfileLoaded, areMealsLoaded, isHydrationLoaded]);
  
  const initialLoading = loading || !user || !userProfile || !todayHydration;

  if (initialLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão e carregando dados...</p>
      </div>
    );
  }

  if (!user || !userProfile || !todayHydration) {
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
            <DashboardMetrics 
                meals={mealsToday}
                userProfile={userProfile}
                hydrationHistory={hydrationHistory}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                    <ConsumedFoodsList 
                        mealEntries={mealEntries} 
                        onMealDeleted={handleMealDeleted}
                    />
                </div>
                <div className="lg:col-span-1">
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
