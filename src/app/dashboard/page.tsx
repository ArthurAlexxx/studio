// src/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { BarChart, Flame, Beef, Droplets, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DashboardCharts } from '@/components/dashboard-charts';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealData } from '@/types/meal';

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);

  const handleMealAdded = (newMealData: MealData[]) => {
    setMeals(prevMeals => [...prevMeals, ...newMealData]);
  };
  
  const totalNutrients = meals.reduce(
    (acc, meal) => {
      acc.calorias += meal.totais.calorias;
      acc.proteinas += meal.totais.proteinas;
      return acc;
    },
    { calorias: 0, proteinas: 0 }
  );

  const calorieGoal = 2000;
  const proteinGoal = 140;

  const calorieProgress = (totalNutrients.calorias / calorieGoal) * 100;
  const proteinProgress = (totalNutrients.proteinas / proteinGoal) * 100;


  const summaryCards = [
    {
      title: 'Calorias Hoje',
      value: `${Math.round(totalNutrients.calorias)}`,
      goal: '2000 kcal',
      icon: Flame,
      color: 'bg-green-100 text-green-700',
      progress: calorieProgress,
    },
    {
      title: 'Proteínas',
      value: `${totalNutrients.proteinas.toFixed(1)}g`,
      goal: '140g',
      icon: Beef,
      color: 'bg-blue-100 text-blue-700',
      progress: proteinProgress,
    },
    {
      title: 'Hidratação',
      value: '0ml',
      goal: '2000ml',
      icon: Droplets,
      color: 'bg-sky-100 text-sky-700',
      progress: 0,
    },
    {
      title: 'Sequência',
      value: '0 dias',
      description: 'Metas atingidas',
      icon: Repeat,
      color: 'bg-amber-100 text-amber-700',
      footer: 'Comece sua jornada!',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-muted-foreground">Visão Geral</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.title} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                  {card.goal && <p className="text-xs text-muted-foreground">Meta: {card.goal}</p>}
                  {card.description && <p className="text-xs text-muted-foreground">{card.description}</p>}
                  {card.progress !== undefined ? (
                    <Progress value={card.progress} className="mt-4 h-2" />
                  ) : card.footer ? (
                     <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1"><BarChart className="h-4 w-4"/> {card.footer}</p>
                  ) : null }
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
              <ConsumedFoodsList meals={meals} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  Distribuição de Macronutrientes
                </CardTitle>
                <CardDescription>Proporção dos macronutrientes consumidos hoje</CardDescription>
              </CardHeader>
              <CardContent>
                 <DashboardCharts chartType="macros" />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                   Evolução Semanal
                </CardTitle>
                 <CardDescription>Consumo de calorias nos últimos 7 dias</CardDescription>
              </CardHeader>
              <CardContent>
                 <DashboardCharts chartType="calories" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
