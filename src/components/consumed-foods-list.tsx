// src/components/consumed-foods-list.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { MealEntry } from '@/types/meal';
import { Utensils, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface ConsumedFoodsListProps {
  mealEntries: MealEntry[];
  onMealDeleted: (entryId: string) => void;
}

const NutrientItem = ({ value, label, colorClass }: { value: string; label: string; colorClass: string }) => (
  <div className="flex flex-col items-center">
    <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export default function ConsumedFoodsList({ mealEntries, onMealDeleted }: ConsumedFoodsListProps) {
  if (mealEntries.length === 0) {
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

  const allMealsWithEntries = mealEntries.flatMap(entry =>
    entry.mealData.alimentos.map(food => ({ ...food, entryId: entry.id }))
  );

  const totalNutrients = mealEntries.reduce(
    (acc, entry) => {
      acc.calorias += entry.mealData.totais.calorias;
      acc.proteinas += entry.mealData.totais.proteinas;
      acc.carboidratos += entry.mealData.totais.carboidratos;
      acc.gorduras += entry.mealData.totais.gorduras;
      acc.fibras += entry.mealData.totais.fibras;
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
        {mealEntries.map((entry, index) => (
          <div key={entry.id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{entry.mealData.alimentos.map(f => f.nome).join(', ')}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.mealData.totais.calorias.toFixed(0)} kcal
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso removerá permanentemente a refeição dos seus registros.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onMealDeleted(entry.id)} className="bg-destructive hover:bg-destructive/90">
                        Sim, remover
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
             <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <NutrientItem value={`${entry.mealData.totais.proteinas.toFixed(1)}g`} label="Proteínas" colorClass="text-blue-500" />
              <NutrientItem value={`${entry.mealData.totais.carboidratos.toFixed(1)}g`} label="Carboidratos" colorClass="text-orange-500" />
              <NutrientItem value={`${entry.mealData.totais.gorduras.toFixed(1)}g`} label="Gorduras" colorClass="text-black" />
              <NutrientItem value={`${entry.mealData.totais.fibras.toFixed(1)}g`} label="Fibras" colorClass="text-gray-500" />
            </div>
            {index < mealEntries.length - 1 && <Separator className="mt-6" />}
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
