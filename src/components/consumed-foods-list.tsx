// src/components/consumed-foods-list.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { MealEntry } from '@/types/meal';
import { Utensils, Trash2, CalendarOff } from 'lucide-react';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsumedFoodsListProps {
  mealEntries: MealEntry[];
  onMealDeleted: (entryId: string) => void;
  showTotals?: boolean;
}

const NutrientItem = ({ value, label, colorClass }: { value: string; label: string; colorClass?: string }) => (
  <div className="flex flex-col items-center text-center">
    <p className={`text-lg font-bold ${colorClass || 'text-foreground'}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default function ConsumedFoodsList({ mealEntries, onMealDeleted, showTotals = true }: ConsumedFoodsListProps) {
    const { toast } = useToast();

    const handleLocalMealDeleted = async (entryId: string) => {
        if (!entryId) {
            toast({ title: "Erro", description: "ID da refeição não encontrado.", variant: "destructive" });
            return;
        }
        try {
            await deleteDoc(doc(db, "meal_entries", entryId));
            onMealDeleted(entryId); // Callback to inform parent component
        } catch(error: any) {
            toast({
                title: "Erro ao remover refeição",
                description: error.message || "Não foi possível remover a refeição.",
                variant: "destructive"
            });
        }
    };


  if (mealEntries.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-xl">
            <Utensils className="h-6 w-6 text-primary" />
            Refeições Registradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center rounded-xl bg-secondary/50">
            <CalendarOff className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-base font-medium text-muted-foreground">Nenhuma refeição encontrada para esta data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
  
  const getMealTypeName = (type: string) => {
    switch (type) {
        case 'cafe-da-manha': return 'Café da Manhã';
        case 'almoco': return 'Almoço';
        case 'jantar': return 'Jantar';
        case 'lanche': return 'Lanche';
        default: return 'Refeição';
    }
  }

  return (
    <Card className="shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-xl">
          <Utensils className="h-6 w-6 text-primary" />
          Refeições do Dia
        </CardTitle>
        <CardDescription>Lista detalhada das refeições e seus valores nutricionais.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealEntries.map((entry) => (
          <div key={entry.id} className="rounded-xl border p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-base">{getMealTypeName(entry.mealType)}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.mealData.alimentos.map(f => `${f.nome} (${f.porcao}${f.unidade})`).join(', ')}
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
                    <AlertDialogAction onClick={() => handleLocalMealDeleted(entry.id)} className="bg-destructive hover:bg-destructive/90">
                        Sim, remover
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Separator />

             <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <NutrientItem value={`${entry.mealData.totais.calorias.toFixed(0)}`} label="Calorias" colorClass="text-green-500" />
              <NutrientItem value={`${entry.mealData.totais.proteinas.toFixed(1)}g`} label="Proteínas" colorClass="text-blue-500" />
              <NutrientItem value={`${entry.mealData.totais.carboidratos.toFixed(1)}g`} label="Carbs" colorClass="text-orange-500" />
              <NutrientItem value={`${entry.mealData.totais.gorduras.toFixed(1)}g`} label="Gorduras" colorClass="text-zinc-600" />
              <NutrientItem value={`${entry.mealData.totais.fibras.toFixed(1)}g`} label="Fibras" colorClass="text-zinc-400" />
            </div>
          </div>
        ))}
      </CardContent>
       {showTotals && totalNutrients.calorias > 0 && (
          <CardFooter className="flex-col items-start bg-secondary/50 p-6 rounded-b-2xl">
            <p className="font-semibold text-lg">Totais do Dia</p>
            <Separator className="my-3"/>
            <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <NutrientItem value={`${Math.round(totalNutrients.calorias)}`} label="Calorias (kcal)" colorClass="text-green-600" />
                <NutrientItem value={`${totalNutrients.proteinas.toFixed(1)}g`} label="Proteínas" colorClass="text-blue-600" />
                <NutrientItem value={`${totalNutrients.carboidratos.toFixed(1)}g`} label="Carboidratos" colorClass="text-orange-600" />
                <NutrientItem value={`${totalNutrients.gorduras.toFixed(1)}g`} label="Gorduras" colorClass="text-zinc-700" />
                <NutrientItem value={`${totalNutrients.fibras.toFixed(1)}g`} label="Fibras" colorClass="text-zinc-500" />
            </div>
          </CardFooter>
        )}
    </Card>
  );
}
