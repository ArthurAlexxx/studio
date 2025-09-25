// src/app/hydration/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile } from '@/types/user';
import type { HydrationEntry } from '@/types/hydration';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday as isTodayFns } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WaterTrackerCard from '@/components/water-tracker-card';
import AppLayout from '@/components/app-layout';
import HydrationProgress from '@/components/hydration-progress';

// Função para obter data local no formato YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
    return format(date, 'yyyy-MM-dd');
}

export default function HydrationPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [todayHydration, setTodayHydration] = useState<HydrationEntry | null>(null);
  const [hydrationHistory, setHydrationHistory] = useState<HydrationEntry[]>([]);
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

  const fetchHistory = useCallback(async (userId: string) => {
    // Consulta simplificada para evitar erro de índice
    const q = query(
      collection(db, 'hydration_entries'),
      where('userId', '==', userId),
      limit(30)
    );

    try {
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HydrationEntry));
      
      // Ordenação feita no cliente
      const sortedHistory = history.sort((a, b) => b.date.localeCompare(a.date));
      
      setHydrationHistory(sortedHistory);
    } catch(e) {
      console.error(e);
      toast({
        title: "Erro ao buscar histórico",
        description: "Não foi possível carregar seu histórico de hidratação.",
        variant: "destructive"
      });
    }
  }, [toast]);

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
                const userWaterGoal = userProfile?.waterGoal || 2000;
                const newEntry: Omit<HydrationEntry, 'id'> = {
                    userId: currentUser.uid,
                    date: todayStr,
                    intake: 0,
                    goal: userWaterGoal,
                };
                setDoc(todayDocRef, newEntry).then(() => {
                  fetchHistory(currentUser.uid); // Refetch history after creating today's entry
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching today's hydration:", error);
            setLoading(false);
        });
        
        fetchHistory(currentUser.uid);

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
  }, [router, fetchHistory, userProfile?.waterGoal]);
  
  const weeklyChartData = useMemo(() => {
    if (!userProfile) return [];

    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(today, { locale: ptBR }) });

    return days.map(day => {
        const dateStr = getLocalDateString(day);
        
        let intake = 0;
        let goal = userProfile.waterGoal || 2000;
        let isComplete = false;

        const historyEntry = hydrationHistory.find(h => h.date === dateStr);
        if (historyEntry) {
            intake = historyEntry.intake;
            goal = historyEntry.goal;
            isComplete = intake >= goal;
        }
        
        return {
            date: day,
            day: format(day, 'E', { locale: ptBR }),
            dayOfMonth: format(day, 'd'),
            intake,
            goal,
            isComplete,
            isToday: isTodayFns(day)
        }
    });
  }, [hydrationHistory, userProfile]);

  const summaryStats = useMemo(() => {
    if (hydrationHistory.length === 0) return { avgIntake: 0, goalMetPercentage: 0 };
    
    const last7DaysHistory = hydrationHistory.filter(h => {
        const entryDate = new Date(h.date + 'T00:00:00');
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        return entryDate >= sevenDaysAgo && entryDate <= today;
    });


    const totalIntake = last7DaysHistory.reduce((acc, curr) => acc + curr.intake, 0);
    const daysGoalMet = last7DaysHistory.filter(d => d.intake >= d.goal).length;
    
    return {
        avgIntake: last7DaysHistory.length > 0 ? totalIntake / last7DaysHistory.length : 0,
        goalMetPercentage: last7DaysHistory.length > 0 ? (daysGoalMet / last7DaysHistory.length) * 100 : 0
    };
  }, [hydrationHistory]);

  const currentStreak = useMemo(() => {
    const sortedHistory = [...hydrationHistory].sort((a, b) => b.date.localeCompare(a.date));
    if (sortedHistory.length === 0) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date();

    // Check today first
    const todayStr = getLocalDateString(expectedDate);
    const todayEntry = sortedHistory.find(e => e.date === todayStr);

    if (todayEntry && todayEntry.intake >= todayEntry.goal) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (todayEntry && todayEntry.intake < todayEntry.goal) {
      // If today goal is not met, but it is today, check from yesterday
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (!todayEntry) {
       // If there's no entry for today, check from yesterday but reset streak
       expectedDate.setDate(expectedDate.getDate() - 1);
    }
    
    // Check consecutive previous days from the rest of the history
    const remainingHistory = sortedHistory.filter(e => e.date < todayStr);

    for (const entry of remainingHistory) {
      const expectedDateStr = getLocalDateString(expectedDate);
      if (entry.date === expectedDateStr) {
        if (entry.intake >= entry.goal) {
          streak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          // Streak is broken if goal not met on an expected day
          break;
        }
      } else if (entry.date < expectedDateStr) {
        // A day is missing, streak is broken
        break;
      }
    }

    return streak;
  }, [hydrationHistory]);


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
            <p className="text-muted-foreground">Acompanhe seu consumo de água e veja sua evolução.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                 <WaterTrackerCard
                    waterIntake={todayHydration.intake}
                    waterGoal={todayHydration.goal}
                    onWaterUpdate={handleWaterUpdate}
                />
            </div>
            <div className="lg:col-span-2">
                 <HydrationProgress
                    weeklyData={weeklyChartData}
                    averageIntake={summaryStats.avgIntake}
                    goalMetPercentage={summaryStats.goalMetPercentage}
                    streak={currentStreak}
                 />
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
