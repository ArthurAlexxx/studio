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
import type { User } from '@supabase/supabase-js';

type UserProfile = {
  id: string;
  full_name: string;
  email?: string;
};

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
    const checkUserSession = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        toast({ title: "Erro de Sessão", description: sessionError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      
      const user = session?.user;

      if (user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          if (profile) {
              setUserProfile({
                id: user.id,
                full_name: profile.full_name,
                email: user.email,
              });
              await fetchMeals(user.id);
          } else {
             throw new Error("Perfil não encontrado. Por favor, tente fazer login novamente.");
          }

        } catch (error: any) {
          toast({
            title: "Erro ao carregar dados do perfil",
            description: error.message,
            variant: "destructive",
          });
          // Se der erro, desloga para forçar um novo login limpo
          await supabase.auth.signOut();
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setMeals([]);
      }
      setLoading(false);
    };

    checkUserSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setMeals([]);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
         if (session?.user && session.user.id !== userProfile?.id) {
            checkUserSession();
         }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, toast, fetchMeals, userProfile?.id]);


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

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} user={userProfile} />
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
