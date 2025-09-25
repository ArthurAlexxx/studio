// src/app/history/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import ConsumedFoodsList from '@/components/consumed-foods-list';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import SummaryCards from '@/components/summary-cards';
import AppLayout from '@/components/app-layout';

import type { MealEntry } from '@/types/meal';
import type { UserProfile } from '@/types/user';


export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
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
    if (!user || !selectedDate) {
      setMealEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const q = query(
      collection(db, "meal_entries"),
      where("userId", "==", user.uid),
      where("date", "==", formattedDate)
    );

    const unsubscribeMeals = onSnapshot(q, (querySnapshot) => {
      const loadedEntries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<MealEntry, 'id'>)
      }));
      setMealEntries(loadedEntries);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching historical meals:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível buscar as refeições para a data selecionada.",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribeMeals();
  }, [user, selectedDate, toast]);
  
  const handleMealDeleted = () => {
    // A atualização já é feita em tempo real pelo onSnapshot
    toast({
        title: "Refeição Removida",
        description: "A refeição foi removida com sucesso."
    });
  }

  const dailyTotals = mealEntries.reduce(
    (acc, entry) => {
      acc.calorias += entry.mealData.totais.calorias;
      acc.proteinas += entry.mealData.totais.proteinas;
      acc.carboidratos += entry.mealData.totais.carboidratos;
      acc.gorduras += entry.mealData.totais.gorduras;
      return acc;
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                <Card className="shadow-sm rounded-2xl">
                        <CardContent className="p-2">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="w-full"
                                locale={ptBR}
                                disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                            />
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
                        <SummaryCards
                            totalNutrients={dailyTotals}
                            calorieGoal={userProfile.calorieGoal}
                            proteinGoal={userProfile.proteinGoal}
                            hideStreak={true}
                        />
                        <ConsumedFoodsList 
                            mealEntries={mealEntries} 
                            onMealDeleted={handleMealDeleted}
                            showTotals={false}
                        />
                    </>
                )}
                </div>
            </div>
        </div>
    </AppLayout>
  );
}
