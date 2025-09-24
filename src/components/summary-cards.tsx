// src/components/summary-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Beef, Star } from 'lucide-react';

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
  const calorieProgress = Math.min((totalNutrients.calorias / calorieGoal) * 100, 100);
  const proteinProgress = Math.min((totalNutrients.proteinas / proteinGoal) * 100, 100);

  const summaryCardsData = [
    {
      title: 'Calorias Consumidas',
      value: `${Math.round(totalNutrients.calorias)}`,
      goal: `${calorieGoal}`,
      unit: 'kcal',
      icon: Flame,
      progress: calorieProgress,
    },
    {
      title: 'Proteínas Ingeridas',
      value: `${totalNutrients.proteinas.toFixed(1)}`,
      goal: `${proteinGoal}`,
      unit: 'g',
      icon: Beef,
      progress: proteinProgress,
    },
    {
      title: 'Sequência de Foco',
      value: `${currentStreak}`,
      description: ` ${currentStreak === 1 ? 'dia' : 'dias'} de consistência`,
      icon: Star,
      footer: currentStreak > 1 ? `Você está pegando o ritmo!` : 'Todo começo é um passo importante!',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {summaryCardsData.map((card, index) => (
        <Card key={card.title} className="shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
                {card.value}
                <span className="text-xl text-muted-foreground ml-1">{card.unit || card.description}</span>
            </div>
            {card.goal ? (
                <p className="text-xs text-muted-foreground">Meta: {card.goal} {card.unit}</p>
            ) : card.footer ? (
                <p className="mt-1 text-xs text-muted-foreground">{card.footer}</p>
            ) : null }
            
            {card.progress !== undefined && (
              <Progress value={card.progress} className="mt-4 h-2" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
