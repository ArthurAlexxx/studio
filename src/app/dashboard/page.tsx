// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealData } from '@/types/meal';
import DashboardMetrics from '@/components/dashboard-metrics';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

type UserProfile = User & { user_metadata: { full_name: string } };

/**
 * @fileoverview A página principal do Dashboard.
 * Gerencia o estado de autenticação e os dados do usuário, garantindo que
 * a interface só seja exibida após a sessão ser 100% confirmada.
 */
export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchMeals = useCallback(async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meal_entries')
        .select('meal_data')
        .eq('user_id', userId)
        .eq('date', today);

      if (error) throw error;
      
      const loadedMeals = data.map((entry: any) => entry.meal_data);
      setMeals(loadedMeals);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar refeições",
        description: error.message || "Não foi possível buscar suas refeições.",
        variant: "destructive"
      });
    }
  }, [supabase, toast]);


  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const currentUser = session.user as UserProfile;
        setUser(currentUser);
        await fetchMeals(currentUser.id);
      }
      setLoading(false); 
    };

    fetchUserAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const currentUser = session.user as UserProfile;
        setUser(currentUser);
        fetchMeals(currentUser.id).finally(() => setLoading(false));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setMeals([]);
        setLoading(false);
      } else if (!session) {
         setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchMeals]);


  const handleMealAdded = (newMealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, newMealData]);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão...</p>
      </div>
    );
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
