// src/app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';

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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    if (!user || !selectedDate) {
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

  if (!user) {
    return (
       <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader 
        onMealAdded={() => {}} 
        user={user} 
        userProfile={userProfile}
        onProfileUpdate={() => {}}
      />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-foreground">Histórico Nutricional</h2>
                <p className="text-muted-foreground">Selecione uma data para ver suas refeições registradas.</p>
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
                            disabled={(date) => date > new Date()}
                        />
                    </CardContent>
               </Card>
            </div>
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <ConsumedFoodsList 
                  mealEntries={mealEntries} 
                  onMealDeleted={handleMealDeleted}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
