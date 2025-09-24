// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealData } from '@/types/meal';
import DashboardMetrics from '@/components/dashboard-metrics';

/**
 * @fileoverview A página principal do Dashboard.
 * É responsável por gerenciar o estado das refeições e orquestrar
 * a exibição dos componentes do dashboard.
 */

export default function DashboardPage() {
  // Estado para armazenar a lista de refeições adicionadas pelo usuário.
  const [meals, setMeals] = useState<MealData[]>([]);

  // Função de callback para atualizar o estado quando uma nova refeição é adicionada.
  const handleMealAdded = (newMealData: MealData[]) => {
    setMeals(prevMeals => [...prevMeals, ...newMealData]);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          {/* Componente que calcula e exibe as métricas e gráficos */}
          <DashboardMetrics meals={meals} />

          {/* Componente para listar os alimentos consumidos */}
          <div className="mt-8">
            <ConsumedFoodsList meals={meals} />
          </div>
        </div>
      </main>
    </div>
  );
}
