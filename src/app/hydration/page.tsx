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
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
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

  const fetchHistory = useCallback(async (uid: string) => {
    try {
        const q = query(
            collection(db, 'hydration_entries'),
            where("userId", "==", uid),
            orderBy("date", "desc"),
            limit(30)
        );
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HydrationEntry));
        setHydrationHistory(history);
    } catch (error: any) {
        console.error("Error fetching hydration history:", error);
        toast({
            title: "Erro ao buscar histórico",
            description: "Não foi possível carregar seu progresso de hidratação.",
            variant: "destructive"
        });
    }
  }, [toast]);
  
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
        fetchHistory(currentUser.uid);

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
                const data = { id: docSnap.id, ...docSnap.data() } as HydrationEntry;
                setTodayHydration(data);
                // Update history with today's data in real-time
                setHydrationHistory(prev => {
                    const index = prev.findIndex(item => item.id === data.id);
                    if (index > -1) {
                        const newHistory = [...prev];
                        newHistory[index] = data;
                        return newHistory;
                    }
                    return [data, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                });
            } else {
                 const goal = userProfile?.waterGoal || 2000;
                const newEntry: Omit<HydrationEntry, 'id'> = {
                    userId: currentUser.uid,
                    date: todayStr,
                    intake: 0,
                    goal: goal,
                };
                setDoc(todayDocRef, newEntry).then(() => {
                    setTodayHydration({ id: todayDocId, ...newEntry });
                });
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
  }, [router, fetchHistory, userProfile?.waterGoal]);
  
  const summaryStats = useMemo(() => {
    const last7DaysHistory = hydrationHistory.filter(entry => 
        isSameDay(parseISO(entry.date), new Date()) || parseISO(entry.date) >= subDays(new Date(), 6)
    );

    const totalIntake = last7DaysHistory.reduce((acc, entry) => acc + entry.intake, 0);
    const averageIntake = last7DaysHistory.length > 0 ? totalIntake / last7DaysHistory.length : 0;
    
    const goalsMet = last7DaysHistory.filter(entry => entry.intake >= entry.goal).length;
    const goalMetPercentage = last7DaysHistory.length > 0 ? (goalsMet / last7DaysHistory.length) * 100 : 0;
    
    return { averageIntake, goalMetPercentage };
  }, [hydrationHistory]);

  const weeklyChartData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const weekEnd = endOfWeek(today, { locale: ptBR });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysOfWeek.map(day => {
        const formattedDate = getLocalDateString(day);
        const entry = hydrationHistory.find(h => h.date === formattedDate);
        return {
            date: day,
            day: format(day, 'E', { locale: ptBR }),
            dayOfMonth: format(day, 'dd'),
            intake: entry?.intake || 0,
            goal: entry?.goal || userProfile?.waterGoal || 2000,
            isComplete: entry ? entry.intake >= entry.goal : false,
            isToday: isSameDay(day, today),
        };
    });
  }, [hydrationHistory, userProfile?.waterGoal]);


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
            <p className="text-muted-foreground">Acompanhe seu consumo de água diário e seu progresso ao longo do tempo.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 w-full">
                 <WaterTrackerCard
                    waterIntake={todayHydration.intake}
                    waterGoal={todayHydration.goal}
                    onWaterUpdate={handleWaterUpdate}
                />
            </div>
             <div className="lg:col-span-2 w-full">
                <HydrationProgress
                    weeklyData={weeklyChartData}
                    averageIntake={summaryStats.averageIntake}
                    goalMetPercentage={summaryStats.goalMetPercentage}
                />
             </div>
        </div>
      </div>
    </AppLayout>
  );
}
