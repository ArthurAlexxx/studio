// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealData } from '@/types/meal';
import DashboardMetrics from '@/components/dashboard-metrics';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';

/**
 * @fileoverview A página principal do Dashboard.
 * É responsável por gerenciar o estado das refeições e orquestrar
 * a exibição dos componentes do dashboard.
 */

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<(User & { full_name: string }) | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSessionAndData = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        toast({ title: 'Erro de Sessão', description: sessionError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      
      if (!session) {
        setLoading(false);
        // Não há sessão, poderia redirecionar para o login
        return;
      }
      
      const currentUser = session.user as (User & { full_name: string });

      // Busca o nome do perfil, se não estiver nos metadados do usuário
      if (!currentUser.full_name) {
          const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', currentUser.id)
              .single();
          currentUser.full_name = profile?.name || currentUser.email || 'Usuário';
      }
      
      setUser(currentUser);

      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('meal_entries')
          .select('meal_data')
          .eq('user_id', currentUser.id)
          .eq('date', today);

        if (error) throw error;
        
        const loadedMeals = data.map((entry: any) => entry.meal_data);
        setMeals(loadedMeals);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível buscar seus dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Recarrega os dados quando o usuário entra ou sai
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchSessionAndData();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };

  }, [supabase, toast]);

  const handleMealAdded = (newMealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, newMealData]);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Carregando seus dados...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} user={user} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
              <>
                {/* Componente que calcula e exibe as métricas e gráficos */}
                <DashboardMetrics meals={meals} />

                {/* Componente para listar os alimentos consumidos */}
                <div className="mt-8">
                  <ConsumedFoodsList meals={meals} />
                </div>
              </>
        </div>
      </main>
    </div>
  );
}
