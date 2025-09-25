// src/app/hydration/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile } from '@/types/user';
import type { HydrationEntry } from '@/types/hydration';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, updateDoc, setDoc, onSnapshot, collection, query, where, getDocs, limit, orderBy, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { differenceInCalendarDays, parseISO, format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WaterTrackerCard from '@/components/water-tracker-card';
import AppLayout from '@/components/app-layout';
import HydrationProgress from '@/components/hydration-progress';

// Função para obter data local no formato YYYY-MM-DD
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


export default function HydrationPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
    if (!user || !userProfile) return;

    const updatedIntake = Math.max(0, newWaterIntake);
    const originalIntake = userProfile.waterIntake;

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
        setUserProfile(prev => prev ? { ...prev, waterIntake: originalIntake } : null);
    }
  }, [user, userProfile, toast]);

  const fetchHistory = useCallback(async (userId: string) => {
    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const startDate = format(subDays(weekStart, 1), 'yyyy-MM-dd'); // Um dia antes para pegar a semana toda

    const q = query(
      collection(db, 'hydration_entries'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => doc.data() as HydrationEntry);

    setHydrationHistory(history);
  }, []);


  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchHistory(currentUser.uid); // Fetch initial history
        
        const userDocRef = doc(db, 'users', currentUser.uid);

        const unsubscribeProfile = onSnapshot(userDocRef, async (userDoc) => {
          let profileData: UserProfile;
          
          if (userDoc.exists()) {
            profileData = userDoc.data() as UserProfile;
            const todayStr = getLocalDateString();
            const lastLogin = profileData.lastLoginDate;
            let updates: Partial<UserProfile> = {};

            if (profileData.waterIntake === undefined) updates.waterIntake = 0;
            if (profileData.waterGoal === undefined) updates.waterGoal = 2000;

            if (lastLogin && lastLogin !== todayStr) {
                const yesterdayStr = getLocalDateString(subDays(new Date(), 1));
                const entryRef = doc(db, 'hydration_entries', `${currentUser.uid}_${yesterdayStr}`);
                
                const batch = writeBatch(db);
                batch.set(entryRef, {
                    userId: currentUser.uid,
                    date: yesterdayStr,
                    intake: profileData.waterIntake,
                    goal: profileData.waterGoal
                });

                updates.waterIntake = 0; 
                if (differenceInCalendarDays(new Date(), parseISO(lastLogin)) === 1) {
                    updates.currentStreak = (profileData.currentStreak || 0) + 1;
                } else { 
                    updates.currentStreak = 1;
                }
                updates.lastLoginDate = todayStr;

                batch.update(userDocRef, updates);
                await batch.commit();

                setUserProfile({ ...profileData, ...updates });
                fetchHistory(currentUser.uid); // refetch history
            } else {
                 if (Object.keys(updates).length > 0) {
                    await updateDoc(userDocRef, updates);
                    setUserProfile({ ...profileData, ...updates });
                 } else {
                    setUserProfile(profileData);
                 }
            }

          } else { 
             profileData = {
              fullName: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              currentStreak: 1,
              lastLoginDate: getLocalDateString(),
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
  }, [router, toast, fetchHistory]);
  
  const weeklyChartData = useMemo(() => {
    if (!userProfile) return [];

    const today = new Date();
    const weekStart = startOfWeek(today, { locale: ptBR });
    const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(today, { locale: ptBR }) });

    return days.map(day => {
        const dateStr = getLocalDateString(day);
        
        let intake = 0;
        let goal = userProfile.waterGoal || 2000;

        if (isToday(day)) {
             intake = userProfile.waterIntake || 0;
        } else {
             const historyEntry = hydrationHistory.find(h => h.date === dateStr);
             if (historyEntry) {
                intake = historyEntry.intake;
                goal = historyEntry.goal;
             }
        }
        
        return {
            date: day,
            day: format(day, 'E', { locale: ptBR }),
            intake: intake,
            goal: goal,
        }
    });
  }, [hydrationHistory, userProfile]);

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
            <p className="text-muted-foreground">Acompanhe seu consumo de água e veja sua evolução.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                 <WaterTrackerCard
                    waterIntake={userProfile.waterIntake}
                    waterGoal={userProfile.waterGoal}
                    onWaterUpdate={handleWaterUpdate}
                />
            </div>
            <div className="lg:col-span-2">
                 <HydrationProgress weeklyData={weeklyChartData} />
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
