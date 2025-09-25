// src/components/summary-cards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Beef, Star, Donut, Droplet } from 'lucide-react';
import { Wheat } from 'lucide-react';

interface SummaryCardsProps {
  totalNutrients: {
    calorias: number;
    proteinas: number;
    carboidratos?: number;
    gorduras?: number;
  };
  calorieGoal: number;
  proteinGoal: number;
  currentStreak?: number;
  hideStreak?: boolean;
}

export default function SummaryCards({ totalNutrients, calorieGoal, proteinGoal, currentStreak, hideStreak = false }: SummaryCardsProps) {
  const calorieProgress = calorieGoal > 0 ? Math.min((totalNutrients.calorias / calorieGoal) * 100, 100) : 0;
  const proteinProgress = proteinGoal > 0 ? Math.min((totalNutrients.proteinas / proteinGoal) * 100, 100) : 0;

  const summaryCardsData = [
    {
      title: 'Calorias',
      value: `${Math.round(totalNutrients.calorias)}`,
      goal: `de ${calorieGoal} kcal`,
      icon: Flame,
      progress: calorieProgress,
      color: 'text-orange-500',
      progressColor: 'bg-orange-500'
    },
    {
      title: 'Proteínas',
      value: `${totalNutrients.proteinas.toFixed(1)}g`,
      goal: `de ${proteinGoal}g`,
      icon: Beef,
      progress: proteinProgress,
      color: 'text-blue-500',
      progressColor: 'bg-blue-500'
    },
    {
      title: 'Carboidratos',
      value: `${(totalNutrients.carboidratos || 0).toFixed(1)}g`,
      icon: Wheat,
      color: 'text-yellow-500',
    },
    {
      title: 'Gorduras',
      value: `${(totalNutrients.gorduras || 0).toFixed(1)}g`,
      icon: Donut,
      color: 'text-pink-500',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCardsData.map((card, index) => (
        <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {card.value}
            </div>
             {card.goal && <p className="text-xs text-muted-foreground">{card.goal}</p>}
            
            {card.progress !== undefined && (
              <Progress value={card.progress} className="mt-4 h-2" indicatorClassName={card.progressColor} />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
