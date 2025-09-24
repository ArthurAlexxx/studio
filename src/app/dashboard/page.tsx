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

/**
 * @fileoverview A página principal do Dashboard.
 * É responsável por gerenciar o estado das refeições e orquestrar
 * a exibição dos componentes do dashboard.
 */

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndSetData = async (currentUserId: string) => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('meal_entries')
          .select('meal_data')
          .eq('user_id', currentUserId)
          .eq('date', today);

        if (error) throw error;
        
        const loadedMeals = data.map((entry: any) => entry.meal_data);
        setMeals(loadedMeals);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar dados",
          description: error.message || "Não foi possível buscar seus dados. Tente recarregar a página.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if(currentUserId) {
          fetchAndSetData(currentUserId);
        } else {
          // Se não há usuário na sessão inicial, paramos o carregamento
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setMeals([]);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };

  }, [supabase, toast]);

  const handleMealAdded = (newMealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, newMealData]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} userId={userId} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          ) : (
            <>
              {/* Componente que calcula e exibe as métricas e gráficos */}
              <DashboardMetrics meals={meals} />

              {/* Componente para listar os alimentos consumidos */}
              <div className="mt-8">
                <ConsumedFoodsList meals={meals} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
