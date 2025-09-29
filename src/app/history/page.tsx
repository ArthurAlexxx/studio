// src/app/history/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDocs, Timestamp, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import ConsumedFoodsList from '@/components/consumed-foods-list';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import SummaryCards from '@/components/summary-cards';
import AppLayout from '@/components/app-layout';
import WaterIntakeSummary from '@/components/water-intake-summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonthPicker } from '@/components/ui/month-picker';

import type { MealEntry } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import type { HydrationEntry } from '@/types/hydration';

const getLocalDateString = (date = new Date()) => {
    // Retorna a data no formato YYYY-MM-DD para o fuso horário de São Paulo
    return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(date);
}

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [hydrationEntries, setHydrationEntries] = useState<HydrationEntry[]>([]);
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

  const handleMealDeleted = useCallback(async (entryId: string) => {
    if (!user || !entryId) {
        toast({ title: "Erro", description: "ID da refeição ou usuário não encontrado.", variant: "destructive" });
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
  }, [toast, user]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data() as UserProfile);
            }
        }, (error) => {
             console.error("Failed to fetch user profile:", error);
        });

        return () => unsubscribeProfile();
      } else {
        setUser(null);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user) {
      setMealEntries([]);
      setHydrationEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetchDayData = () => {
        if (!selectedDate) {
            setLoading(false);
            setMealEntries([]);
            setHydrationEntries([]);
            return;
        }
        const formattedDate = getLocalDateString(selectedDate);
        let mealsLoaded = false;
        let hydrationLoaded = false;

        const checkLoadingDone = () => {
            if (mealsLoaded && hydrationLoaded) {
                setLoading(false);
            }
        }

        // Fetch Meals for the day
        const mealsQuery = query(
            collection(db, "meal_entries"),
            where("userId", "==", user.uid),
            where("date", "==", formattedDate)
        );

        const unsubscribeMeals = onSnapshot(mealsQuery, (querySnapshot) => {
            const loadedEntries = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<MealEntry, 'id'>)
            }));
            loadedEntries.sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
            setMealEntries(loadedEntries);
            mealsLoaded = true;
            checkLoadingDone();
        }, (error) => {
            console.error("Error fetching daily meals:", error);
            mealsLoaded = true;
            checkLoadingDone();
        });

        // Fetch Hydration for the day
        const hydrationDocId = `${user.uid}_${formattedDate}`;
        const hydrationDocRef = doc(db, 'hydration_entries', hydrationDocId);
        const unsubscribeHydration = onSnapshot(hydrationDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setHydrationEntries([{ id: docSnap.id, ...docSnap.data() } as HydrationEntry]);
            } else {
                setHydrationEntries([]);
            }
            hydrationLoaded = true;
            checkLoadingDone();
        }, (error) => {
            console.error("Error fetching daily hydration:", error);
            hydrationLoaded = true;
            checkLoadingDone();
        });
        
        return () => {
            unsubscribeMeals();
            unsubscribeHydration();
        };
    };

    const fetchMonthData = async () => {
        const start = startOfMonth(selectedMonth);
        const end = endOfMonth(selectedMonth);
        const startDateString = getLocalDateString(start);
        const endDateString = getLocalDateString(end);

        // Fetch Meals for the month
        const mealsQuery = query(
            collection(db, "meal_entries"),
            where("userId", "==", user.uid),
            where("date", ">=", startDateString),
            where("date", "<=", endDateString)
        );
        const mealDocs = await getDocs(mealsQuery);
        const meals = mealDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealEntry));
        setMealEntries(meals);

        // Fetch Hydration for the month
        const hydrationQuery = query(
            collection(db, 'hydration_entries'),
            where("userId", "==", user.uid),
            where("date", ">=", startDateString),
            where("date", "<=", endDateString)
        );
        const hydrationDocs = await getDocs(hydrationQuery);
        const hydration = hydrationDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as HydrationEntry));
        setHydrationEntries(hydration);
        
        setLoading(false);
    };

    let unsubscribe: (() => void) | undefined;
    if (viewMode === 'day') {
        unsubscribe = fetchDayData();
    } else {
        fetchMonthData().catch(err => {
            console.error("Error fetching month data:", err);
            setLoading(false);
            toast({
                title: "Erro ao carregar dados do mês",
                description: "Não foi possível buscar os dados para o mês selecionado.",
                variant: "destructive"
            });
        });
    }

    return () => {
        if (unsubscribe) unsubscribe();
    };

  }, [user, selectedDate, selectedMonth, viewMode, toast]);

  const { dailyTotals, monthlyTotals } = useMemo(() => {
    const daily = mealEntries.reduce(
        (acc, entry) => {
            acc.calorias += entry.mealData.totais.calorias;
            acc.proteinas += entry.mealData.totais.proteinas;
            acc.carboidratos += entry.mealData.totais.carboidratos;
            acc.gorduras += entry.mealData.totais.gorduras;
            return acc;
        },
        { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
    );
    const monthly = viewMode === 'month' ? daily : { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 };
    return { dailyTotals: daily, monthlyTotals: monthly };
  }, [mealEntries, viewMode]);

  const dailyHydration = hydrationEntries.length > 0 ? hydrationEntries[0] : null;
  
  const monthlyHydrationTotal = useMemo(() => {
    if (viewMode !== 'month') return 0;
    return hydrationEntries.reduce((acc, entry) => acc + entry.intake, 0);
  }, [hydrationEntries, viewMode]);


  if (!user || !userProfile) {
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
                <h2 className="text-2xl font-bold text-foreground">Histórico Nutricional</h2>
                <p className="text-muted-foreground">Selecione uma data para ver o detalhe de suas refeições e o resumo nutricional do dia.</p>
            </div>

            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'month')} className="w-full mb-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="day">Diário</TabsTrigger>
                    <TabsTrigger value="month">Mensal</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="shadow-sm rounded-2xl">
                        <CardContent className="p-2">
                             {viewMode === 'day' ? (
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    className="w-full"
                                    locale={ptBR}
                                    disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                                />
                            ) : (
                               <MonthPicker
                                    month={selectedMonth}
                                    setMonth={setSelectedMonth}
                               />
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64 rounded-xl bg-secondary/30">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="md:col-span-2">
                                <SummaryCards
                                    totalNutrients={viewMode === 'day' ? dailyTotals : monthlyTotals}
                                    calorieGoal={viewMode === 'day' ? (userProfile.calorieGoal) : (userProfile.calorieGoal * 30)}
                                    proteinGoal={viewMode === 'day' ? (userProfile.proteinGoal) : (userProfile.proteinGoal * 30)}
                                    hideStreak={true}
                                />
                           </div>
                           <div className="md:col-span-2">
                                <WaterIntakeSummary 
                                    hydrationEntry={viewMode === 'day' ? dailyHydration : null}
                                    monthlyTotal={viewMode === 'month' ? monthlyHydrationTotal : undefined}
                                    monthlyGoal={viewMode === 'month' ? (userProfile.waterGoal * 30) : undefined}
                                />
                           </div>
                        </div>
                        {viewMode === 'day' && (
                            <ConsumedFoodsList 
                                mealEntries={mealEntries} 
                                onMealDeleted={handleMealDeleted}
                                onMealEdit={() => {}}
                                showTotals={false}
                            />
                        )}
                         {viewMode === 'month' && mealEntries.length === 0 && hydrationEntries.length === 0 && !loading &&(
                            <div className="flex flex-col items-center justify-center h-40 text-center rounded-xl bg-secondary/50">
                                <p className="text-base font-medium text-muted-foreground">Nenhum dado encontrado para este mês.</p>
                            </div>
                         )}
                    </>
                )}
                </div>
            </div>
        </div>
    </AppLayout>
  );
}
