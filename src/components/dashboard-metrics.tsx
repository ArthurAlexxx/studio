// src/components/dashboard-metrics.tsx
import type { MealData } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import SummaryCards from './summary-cards';

interface DashboardMetricsProps {
  meals: MealData[];
  userProfile: UserProfile | null;
}

/**
 * @fileoverview Componente para calcular e distribuir as métricas do dashboard.
 * Ele centraliza a lógica de cálculo dos totais de nutrientes e prepara os dados
 * para os componentes de visualização (cards).
 */
export default function DashboardMetrics({ meals, userProfile }: DashboardMetricsProps) {
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

  // Metas diárias do perfil do usuário, com fallback.
  const calorieGoal = userProfile?.calorieGoal || 2000;
  const proteinGoal = userProfile?.proteinGoal || 140;
  
  return (
    <>
      <div className="mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Visão Geral de Hoje</h2>
        <p className="text-muted-foreground">Seu resumo diário de nutrição e metas.</p>
      </div>
      
      {/* Componente para os cards de resumo */}
      <SummaryCards
        totalNutrients={totalNutrients}
        calorieGoal={calorieGoal}
        proteinGoal={proteinGoal}
        currentStreak={userProfile?.currentStreak || 0}
      />
    </>
  );
}
