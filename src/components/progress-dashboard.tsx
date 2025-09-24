import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from './dashboard-charts';
import { MealData } from '@/types/meal';

interface ProgressDashboardProps {
  meals: MealData[];
}


export function ProgressDashboard({ meals }: ProgressDashboardProps) {

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

  const macrosData = [
    { name: 'Proteínas', value: totalNutrients.proteinas, fill: 'hsl(var(--chart-1))' },
    { name: 'Carboidratos', value: totalNutrients.carboidratos, fill: 'hsl(var(--chart-2))' },
    { name: 'Gorduras', value: totalNutrients.gorduras, fill: 'hsl(var(--chart-3))' },
  ];

  const weeklyCaloriesData = [
    { day: 'Seg', calories: 1800 },
    { day: 'Ter', calories: 2000 },
    { day: 'Qua', calories: 2200 },
    { day: 'Qui', calories: 1900 },
    { day: 'Sex', calories: 2300 },
    { day: 'Sáb', calories: 2500 },
    { day: 'Dom', calories: Math.round(totalNutrients.calorias) },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline">Consumo Calórico Semanal</CardTitle>
          <CardDescription>
            Acompanhe a ingestão de calorias ao longo da semana.
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <DashboardCharts chartType="calories" data={weeklyCaloriesData} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Distribuição de Macros</CardTitle>
          <CardDescription>
            Análise diária de proteínas, carboidratos e gorduras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardCharts chartType="macros" data={macrosData} />
        </CardContent>
      </Card>
    </div>
  );
}
