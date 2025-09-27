// src/components/dashboard-metrics.tsx
import type { UserProfile } from '@/types/user';
import SummaryCards from './summary-cards';
import { Pencil } from 'lucide-react';

interface DashboardMetricsProps {
  totalNutrients: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
  };
  userProfile: UserProfile | null;
}

export default function DashboardMetrics({ totalNutrients, userProfile }: DashboardMetricsProps) {
  const calorieGoal = userProfile?.calorieGoal || 2000;
  const proteinGoal = userProfile?.proteinGoal || 140;
  
  return (
    <section>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Visão Geral de Hoje</h1>
        <p className="text-muted-foreground">Seu resumo diário de nutrição e metas.</p>
      </div>
      
      <SummaryCards
        totalNutrients={totalNutrients}
        calorieGoal={calorieGoal}
        proteinGoal={proteinGoal}
        currentStreak={userProfile?.currentStreak || 0}
      />
      <p className="text-xs text-muted-foreground mt-4 text-center animate-fade-in max-w-xl mx-auto">
        Atenção: Os valores nutricionais são aproximados e calculados por IA. Se souber os valores corretos, você pode editar cada refeição clicando no ícone <Pencil className='inline h-3 w-3'/>.
      </p>
    </section>
  );
}
