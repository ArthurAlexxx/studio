// src/components/summary-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Beef, Repeat } from 'lucide-react';

interface SummaryCardsProps {
  totalNutrients: {
    calorias: number;
    proteinas: number;
  };
  calorieGoal: number;
  proteinGoal: number;
  currentStreak: number;
}

/**
 * @fileoverview Componente que exibe os cards de resumo no dashboard.
 * Mostra métricas principais como calorias, proteínas, e sequência.
 */
export default function SummaryCards({ totalNutrients, calorieGoal, proteinGoal, currentStreak }: SummaryCardsProps) {
  const calorieProgress = (totalNutrients.calorias / calorieGoal) * 100;
  const proteinProgress = (totalNutrients.proteinas / proteinGoal) * 100;

  const summaryCardsData = [
    {
      title: 'Calorias Hoje',
      value: `${Math.round(totalNutrients.calorias)}`,
      goal: `${calorieGoal} kcal`,
      icon: Flame,
      progress: calorieProgress,
    },
    {
      title: 'Proteínas',
      value: `${totalNutrients.proteinas.toFixed(1)}g`,
      goal: `${proteinGoal}g`,
      icon: Beef,
      progress: proteinProgress,
    },
    {
      title: 'Sequência de Login',
      value: `${currentStreak} ${currentStreak === 1 ? 'dia' : 'dias'}`,
      description: 'Mantenha a constância!',
      icon: Repeat,
      footer: currentStreak > 0 ? `Você está em uma sequência de ${currentStreak} dias!` : 'Comece sua jornada!',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {summaryCardsData.map((card) => (
        <Card key={card.title} className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
            {card.goal ? (
                <p className="text-xs text-muted-foreground">Meta: {card.goal}</p>
            ) : card.description ? (
                <p className="text-xs text-muted-foreground">{card.description}</p>
            ): null }
            
            {card.progress !== undefined ? (
              <Progress value={card.progress} className="mt-4 h-2" />
            ) : card.footer ? (
              <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">{card.footer}</p>
            ) : null }
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
