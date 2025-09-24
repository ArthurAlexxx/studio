// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealData } from '@/types/meal';
import DashboardMetrics from '@/components/dashboard-metrics';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified) {
          toast({
            title: "Acesso Negado",
            description: "Por favor, verifique seu e-mail para acessar o dashboard.",
            variant: "destructive",
            duration: 5000,
          });
          auth.signOut();
          router.push('/login');
          return;
        }

        setUser(currentUser);
        try {
          const today = new Date().toISOString().split('T')[0];
          const q = query(
            collection(db, "meal_entries"),
            where("userId", "==", currentUser.uid),
            where("date", "==", today)
          );
          const querySnapshot = await getDocs(q);
          const loadedMeals = querySnapshot.docs.map(doc => doc.data().mealData as MealData);
          setMeals(loadedMeals);
        } catch (error: any) {
          toast({
            title: "Erro ao carregar refeições",
            description: error.message || "Não foi possível buscar suas refeições.",
            variant: "destructive"
          });
        }
      } else {
        setUser(null);
        setMeals([]);
        // Redireciona para o login se não houver usuário
        router.push('/login');
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, toast]);

  const handleMealAdded = (newMealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, newMealData]);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão e carregando dados...</p>
      </div>
    );
  }

  if (!user) {
     // Renderiza nada ou um redirect enquanto espera o useEffect redirecionar
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} user={user} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
              <>
                <DashboardMetrics meals={meals} />
                <div className="mt-8">
                  <ConsumedFoodsList meals={meals} />
                </div>
              </>
        </div>
      </main>
    </div>
  );
}
