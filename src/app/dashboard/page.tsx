
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
import { collection, query, where, doc, onSnapshot, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { subDays, eachDayOfInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import AppLayout from '@/components/app-layout';
import WaterTrackerCard from '@/components/water-tracker-card';
import ChartsSection from '@/components/charts-section';
import EditMealModal from '@/components/edit-meal-modal';

const getLocalDateString = (date = new Date()) => {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(date);
}

export default function DashboardPage() {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationEntry[]>([]);
  const [weeklyCalories, setWeeklyCalories] = useState<Record<string, number>>({});
  const [todayHydration, setTodayHydration] = useState<HydrationEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [areMealsLoaded, setAreMealsLoaded] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isHydrationLoaded, setIsHydrationLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);

  const handleMealAdded = useCallback(() => {
    toast({
        title: 'Refeição Adicionada! ✅',
        description: 'Sua refeição foi registrada com sucesso.',
    });
  }, [toast]);

  const handleMealDeleted = useCallback(async (entryId: string) => {
    if (!user || !entryId) {
        toast({ title: "Erro", description: "ID da refeição ou usuário não encontrado.", variant: "destructive" });
        return;
    }
    
    // Optimistic UI update
    setMealEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));

    try {
        await deleteDoc(doc(db, "meal_entries", entryId));
        toast({
            title: "Refeição Removida",
            description: "A refeição foi removida com sucesso."
        });
    } catch(error: any) {
        // Revert UI change on error
        // Note: This requires re-fetching or more complex state management.
        // For simplicity, we'll rely on the snapshot listener to eventually correct the state.
        toast({
            title: "Erro ao remover refeição",
            description: error.message || "Não foi possível remover a refeição. A página será atualizada.",
            variant: "destructive"
        });
        // The onSnapshot listener will automatically handle reverting the UI if deletion fails
        // by re-adding the item that failed to be deleted from the server.
    }
  }, [toast, user]);

  const handleMealUpdate = useCallback(async (updatedMeal: MealEntry) => {
    const mealRef = doc(db, 'meal_entries', updatedMeal.id);
    try {
      await updateDoc(mealRef, {
        mealData: updatedMeal.mealData,
      });
      toast({
        title: 'Refeição Atualizada!',
        description: 'Os valores nutricionais foram atualizados com sucesso.',
      });
      setEditingMeal(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive',
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
        
        const sevenDaysAgoStr = getLocalDateString(subDays(new Date(), 6));
        const weeklyMealsQuery = query(
            collection(db, "meal_entries"),
            where("userId", "==", currentUser.uid),
            where("date", ">=", sevenDaysAgoStr)
        );

        const unsubscribeWeeklyMeals = onSnapshot(weeklyMealsQuery, (snapshot) => {
            const weekDates = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
            const caloriesByDay: Record<string, number> = {};
            weekDates.forEach(d => {
                caloriesByDay[getLocalDateString(d)] = 0;
            });

            snapshot.docs.forEach(doc => {
                const meal = doc.data();
                if (meal.date in caloriesByDay) {
                    caloriesByDay[meal.date] += meal.mealData.totais.calorias || 0;
                }
            });
            setWeeklyCalories(caloriesByDay);
        }, (error) => {
            console.error("FirebaseError:", error.message);
        });

        const todayDocId = `${currentUser.uid}_${todayStr}`;
        const todayDocRef = doc(db, 'hydration_entries', todayDocId);
        
        const unsubscribeTodayHydration = onSnapshot(todayDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as HydrationEntry;
                setTodayHydration(data);
                setHydrationHistory(prevHistory => {
                    const existingIndex = prevHistory.findIndex(h => h.id === data.id);
                    if (existingIndex > -1) {
                        const newHistory = [...prevHistory];
                        newHistory[existingIndex] = data;
                        return newHistory;
                    }
                    return [...prevHistory, data].sort((a, b) => a.date.localeCompare(b.date));
                });

            } else {
                setTodayHydration(null);
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
                     setHydrationHistory(prev => [...prev, newHydrationEntry].sort((a, b) => a.date.localeCompare(b.date)));
                });
            }
        }, (error) => {
            console.error("Error fetching today's hydration:", error);
        });
        
        const weeklyHydrationQuery = query(
          collection(db, 'hydration_entries'),
          where('userId', '==', currentUser.uid),
          where('date', '>=', sevenDaysAgoStr)
        );

        const unsubscribeWeeklyHydration = onSnapshot(weeklyHydrationQuery, (snapshot) => {
          const weeklyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HydrationEntry));
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
            unsubscribeWeeklyMeals();
            unsubscribeTodayHydration();
            unsubscribeWeeklyHydration();
        };

      } else {
        setUser(null);
        setMealEntries([]);
        setUserProfile(null);
        setTodayHydration(null);
        setHydrationHistory([]);
        setWeeklyCalories({});
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

   const totalNutrients = useMemo(() => mealEntries.reduce(
        (acc, meal) => {
            acc.calorias += meal.mealData.totais.calorias;
            acc.proteinas += meal.mealData.totais.proteinas;
            acc.carboidratos += meal.mealData.totais.carboidratos;
            acc.gorduras += meal.mealData.totais.gorduras;
            return acc;
        },
        { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
    ), [mealEntries]);
    
    const macrosData = useMemo(() => [
        { name: 'Proteínas', value: totalNutrients.proteinas, fill: 'hsl(var(--chart-1))' },
        { name: 'Carboidratos', value: totalNutrients.carboidratos, fill: 'hsl(var(--chart-3))' },
        { name: 'Gorduras', value: totalNutrients.gorduras, fill: 'hsl(var(--chart-2))' },
    ], [totalNutrients]);
    
    const today = new Date();
    const daysOfWeek = eachDayOfInterval({ start: subDays(today, 6), end: today });
    
    const weeklyCaloriesData = useMemo(() => daysOfWeek.map(day => {
        const dateStr = getLocalDateString(day);
        return {
            day: format(day, 'E', { locale: ptBR }).charAt(0).toUpperCase() + format(day, 'E', { locale: ptBR }).slice(1,3),
            calories: Math.round(weeklyCalories[dateStr] || 0), 
        };
    }), [daysOfWeek, weeklyCalories]);
    
    const weeklyHydrationData = useMemo(() => {
      return daysOfWeek.map(day => {
          const dateStr = getLocalDateString(day);
          const entry = hydrationHistory.find(h => h.date === dateStr);
          return {
              day: format(day, 'E', { locale: ptBR }).charAt(0).toUpperCase() + format(day, 'E', { locale: ptBR }).slice(1,3),
              intake: entry ? entry.intake : 0,
          };
      });
    }, [daysOfWeek, hydrationHistory]);
  
  const initialLoading = loading || !user || !userProfile;

  if (initialLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
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
        onMealAdded={handleMealAdded}
        onProfileUpdate={handleProfileUpdate}
    >
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <DashboardMetrics
                totalNutrients={totalNutrients}
                userProfile={userProfile}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2">
                    <ConsumedFoodsList 
                        mealEntries={mealEntries} 
                        onMealDeleted={handleMealDeleted}
                        onMealEdit={(meal) => setEditingMeal(meal)}
                    />
                </div>
                <div className="lg:col-span-1">
                   {todayHydration && (
                     <WaterTrackerCard
                        waterIntake={todayHydration.intake}
                        waterGoal={todayHydration.goal}
                        onWaterUpdate={handleWaterUpdate}
                    />
                   )}
                </div>
            </div>

            <ChartsSection
              macrosData={macrosData}
              weeklyCaloriesData={weeklyCaloriesData}
              weeklyHydrationData={weeklyHydrationData}
            />
        </div>
         {editingMeal && (
            <EditMealModal
                isOpen={!!editingMeal}
                onOpenChange={() => setEditingMeal(null)}
                mealEntry={editingMeal}
                onMealUpdate={handleMealUpdate}
            />
        )}
    </AppLayout>
  );
}

    