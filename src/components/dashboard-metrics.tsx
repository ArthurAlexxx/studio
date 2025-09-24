// src/components/dashboard-metrics.tsx
import type { MealData } from '@/types/meal';
import SummaryCards from './summary-cards';
import ChartsSection from './charts-section';

interface DashboardMetricsProps {
  meals: MealData[];
}

/**
 * @fileoverview Componente para calcular e distribuir as métricas do dashboard.
 * Ele centraliza a lógica de cálculo dos totais de nutrientes e prepara os dados
 * para os componentes de visualização (cards e gráficos).
 */
export default function DashboardMetrics({ meals }: DashboardMetricsProps) {
  // Calcula os totais de nutrientes a partir da lista de refeições.
  const totalNutrients = meals.reduce(
    (acc, meal) => {
      acc.calorias += meal.totais.calorias;
      acc.proteinas += meal.totais.proteinas;
      acc.carboidratos += meal.totais.carboidratos;
      acc.gorduras += meal.totais.gorduras;
      return acc;
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  // Metas diárias (poderiam vir de um perfil de usuário no futuro).
  const calorieGoal = 2000;
  const proteinGoal = 140;

  // Prepara os dados para os gráficos.
  const macrosData = [
    { name: 'Proteínas', value: totalNutrients.proteinas, fill: 'hsl(var(--chart-1))' },
    { name: 'Carboidratos', value: totalNutrients.carboidratos, fill: 'hsl(var(--chart-2))' },
    { name: 'Gorduras', value: totalNutrients.gorduras, fill: 'hsl(var(--chart-3))' },
  ];

  const weeklyCaloriesData = [
    { day: 'Seg', calories: 0 },
    { day: 'Ter', calories: 0 },
    { day: 'Qua', calories: 0 },
    { day: 'Qui', calories: 0 },
    { day: 'Sex', calories: 0 },
    { day: 'Sáb', calories: 0 },
    { day: 'Dom', calories: Math.round(totalNutrients.calorias) }, // Atualiza o dia atual
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-muted-foreground">Visão Geral</h2>
      </div>
      
      {/* Componente para os cards de resumo */}
      <SummaryCards
        totalNutrients={totalNutrients}
        calorieGoal={calorieGoal}
        proteinGoal={proteinGoal}
      />

      {/* Componente para a seção de gráficos */}
      <ChartsSection
        macrosData={macrosData}
        weeklyCaloriesData={weeklyCaloriesData}
      />
    </>
  );
}
