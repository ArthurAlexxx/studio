
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
    const q = query(
      collection(db, 'hydration_entries'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(30)
    );

    try {
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HydrationEntry));
      setHydrationHistory(history);
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
                const newEntry: Omit<HydrationEntry, 'id'> = {
                    userId: currentUser.uid,
                    date: todayStr,
                    intake: 0,
                    goal: userProfile?.waterGoal || 2000,
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
        const historyEntry = hydrationHistory.find(h => h.date === dateStr);
        
        const intake = historyEntry?.intake || 0;
        const goal = historyEntry?.goal || userProfile.waterGoal || 2000;
        
        return {
            date: day,
            day: format(day, 'E', { locale: ptBR }),
            dayOfMonth: format(day, 'd'),
            intake,
            goal,
            isComplete: intake >= goal,
            isToday: isTodayFns(day)
        }
    });
  }, [hydrationHistory, userProfile]);

  const summaryStats = useMemo(() => {
    if (hydrationHistory.length === 0) return { avgIntake: 0, goalMetPercentage: 0 };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const last7DaysHistory = hydrationHistory.filter(h => {
        const entryDate = new Date(h.date.replace(/-/g, '/'));
        entryDate.setHours(0, 0, 0, 0);
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
    const sortedHistory = [...hydrationHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedHistory.length === 0) {
      return 0;
    }
  
    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);
  
    // Check if today's entry met the goal
    const todayEntry = sortedHistory.find(e => e.date === getLocalDateString(expectedDate));
    if (todayEntry && todayEntry.intake >= todayEntry.goal) {
      streak++;
    } else if (!todayEntry || todayEntry.intake < todayEntry.goal) {
      // If today's goal is not met, but yesterday's was, the streak is from yesterday.
      // So we start checking from yesterday.
      // If there is no entry for today, the streak is 0 unless we find it from yesterday.
       if (!todayEntry) {
          expectedDate.setDate(expectedDate.getDate() -1);
          const yesterdayEntry = sortedHistory.find(e => e.date === getLocalDateString(expectedDate));
          if(yesterdayEntry && yesterdayEntry.intake >= yesterdayEntry.goal){
            streak++;
          } else {
            return 0;
          }
       } else {
         return 0;
       }
    }
  
    // Check previous days
    for (let i = 1; i < sortedHistory.length; i++) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const expectedDateStr = getLocalDateString(expectedDate);
      const entry = sortedHistory.find(e => e.date === expectedDateStr);
  
      if (entry && entry.intake >= entry.goal) {
        streak++;
      } else {
        // Streak is broken
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
