// src/components/dashboard-metrics.tsx
import type { MealData } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import type { HydrationEntry } from '@/types/hydration';
import SummaryCards from './summary-cards';
import ChartsSection from './charts-section';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardMetricsProps {
  meals: MealData[];
  userProfile: UserProfile | null;
  hydrationHistory: HydrationEntry[];
}

/**
 * @fileoverview Componente para calcular e distribuir as métricas do dashboard.
 * Ele centraliza a lógica de cálculo dos totais de nutrientes e prepara os dados
 * para os componentes de visualização (cards e gráficos).
 */
export default function DashboardMetrics({ meals, userProfile, hydrationHistory }: DashboardMetricsProps) {
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

  // Prepara os dados para os gráficos.
  const macrosData = [
    { name: 'Proteínas', value: totalNutrients.proteinas, fill: 'hsl(var(--chart-1))' },
    { name: 'Carboidratos', value: totalNutrients.carboidratos, fill: 'hsl(var(--chart-3))' },
    { name: 'Gorduras', value: totalNutrients.gorduras, fill: 'hsl(var(--chart-2))' },
  ];

  // Gera os dados para os gráficos de evolução semanal usando date-fns.
  const today = new Date();
  const weekStart = startOfWeek(today, { locale: ptBR });
  const weekEnd = endOfWeek(today, { locale: ptBR });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyCaloriesData = daysOfWeek.map(day => {
    const isToday = isSameDay(day, today);
    return {
      day: format(day, 'E', { locale: ptBR }).charAt(0).toUpperCase() + format(day, 'E', { locale: ptBR }).slice(1,3),
      calories: isToday ? Math.round(totalNutrients.calorias) : 0, // Mock: No momento só temos dados de hoje
    };
  });
  
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

      {/* Componente para a seção de gráficos */}
      <ChartsSection
        macrosData={macrosData}
        weeklyCaloriesData={weeklyCaloriesData}
      />
    </>
  );
}
