// src/components/consumed-foods-list.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { MealData } from '@/types/meal';
import { Utensils } from 'lucide-react';

interface ConsumedFoodsListProps {
  meals: MealData[];
}

const NutrientItem = ({ value, label, colorClass }: { value: string; label: string; colorClass: string }) => (
  <div className="flex flex-col items-center">
    <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default function ConsumedFoodsList({ meals }: ConsumedFoodsListProps) {
  if (meals.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            Alimentos Consumidos Hoje
          </CardTitle>
          <CardDescription>Lista detalhada dos alimentos e seus valores nutricionais.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-lg font-semibold text-muted-foreground">Nenhuma refeição adicionada ainda.</p>
            <p className="text-sm text-muted-foreground">Clique em "Adicionar Refeição" para começar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allFoods = meals.flatMap(meal => meal.alimentos);
  const totalNutrients = meals.reduce(
    (acc, meal) => {
      acc.calorias += meal.totais.calorias;
      acc.proteinas += meal.totais.proteinas;
      acc.carboidratos += meal.totais.carboidratos;
      acc.gorduras += meal.totais.gorduras;
      acc.fibras += meal.totais.fibras;
      return acc;
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, fibras: 0 }
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          Alimentos Consumidos Hoje
        </CardTitle>
        <CardDescription>Lista detalhada dos alimentos e seus valores nutricionais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {allFoods.map((food, index) => (
          <div key={index}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{food.nome}</p>
                <p className="text-sm text-muted-foreground">{food.porcao} {food.unidade}</p>
              </div>
              <div className="text-sm font-semibold bg-secondary px-2 py-1 rounded-md">
                {Math.round(food.calorias)} kcal
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <NutrientItem value={`${food.proteinas.toFixed(1)}g`} label="Proteínas" colorClass="text-blue-500" />
              <NutrientItem value={`${food.carboidratos.toFixed(1)}g`} label="Carboidratos" colorClass="text-orange-500" />
              <NutrientItem value={`${food.gorduras.toFixed(1)}g`} label="Gorduras" colorClass="text-black" />
              <NutrientItem value={`${food.fibras.toFixed(1)}g`} label="Fibras" colorClass="text-gray-500" />
            </div>
            {index < allFoods.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col items-start bg-secondary/50 p-6 rounded-b-xl">
        <p className="font-semibold text-lg">Totais do Dia</p>
        <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <NutrientItem value={`${Math.round(totalNutrients.calorias)}`} label="Calorias (kcal)" colorClass="text-green-500" />
            <NutrientItem value={`${totalNutrients.proteinas.toFixed(1)}g`} label="Proteínas" colorClass="text-blue-500" />
            <NutrientItem value={`${totalNutrients.carboidratos.toFixed(1)}g`} label="Carboidratos" colorClass="text-orange-500" />
            <NutrientItem value={`${totalNutrients.gorduras.toFixed(1)}g`} label="Gorduras" colorClass="text-black" />
            <NutrientItem value={`${totalNutrients.fibras.toFixed(1)}g`} label="Fibras" colorClass="text-gray-500" />
        </div>
      </CardFooter>
    </Card>
  );
}
