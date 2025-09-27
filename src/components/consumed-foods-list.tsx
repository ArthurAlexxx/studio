// src/components/consumed-foods-list.tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { MealEntry } from '@/types/meal';
import { Utensils, Trash2, CalendarOff, Flame, Beef, Wheat, Donut, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface ConsumedFoodsListProps {
  mealEntries: MealEntry[];
  onMealDeleted: (entryId: string) => void;
  onMealEdit: (mealEntry: MealEntry) => void;
  showTotals?: boolean;
}

const NutrientItem = ({ value, label, icon: Icon, colorClass }: { value: string; label: string; icon: React.ElementType; colorClass?: string }) => (
  <div className="flex items-center gap-2">
    <Icon className={`h-4 w-4 ${colorClass || 'text-muted-foreground'}`} />
    <div>
        <p className={`text-sm font-semibold ${colorClass || 'text-foreground'}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

export default function ConsumedFoodsList({ mealEntries, onMealDeleted, onMealEdit, showTotals = true }: ConsumedFoodsListProps) {

  if (mealEntries.length === 0) {
    return (
      <Card className="shadow-sm rounded-2xl h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-semibold text-lg">
            <Utensils className="h-6 w-6 text-primary" />
            Refeições do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-center rounded-xl bg-secondary/30">
            <CalendarOff className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-base font-medium text-muted-foreground">Nenhuma refeição registrada hoje.</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione uma refeição para começar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
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
        <CardTitle className="flex items-center gap-2 font-semibold text-lg">
          <Utensils className="h-6 w-6 text-primary" />
          Refeições do Dia
        </CardTitle>
        {showTotals && <CardDescription>Lista detalhada das refeições e seus valores nutricionais. Clique em <Pencil className='inline h-3 w-3'/> para editar.</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-3">
       <TooltipProvider>
        {mealEntries.map((entry) => (
          <div key={entry.id} className="rounded-xl border p-4 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-base">{getMealTypeName(entry.mealType)}</p>
                <p className="text-sm text-muted-foreground max-w-xs truncate">
                  {entry.mealData.alimentos.map(f => f.nome).join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500" onClick={() => onMealEdit(entry)}>
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar Valores</p>
                    </TooltipContent>
                </Tooltip>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Remover Refeição</p>
                            </TooltipContent>
                        </Tooltip>
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
            </div>
            
            <Separator />

             <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
              <NutrientItem value={`${entry.mealData.totais.calorias.toFixed(0)} kcal`} label="Calorias" icon={Flame} colorClass="text-orange-500" />
              <NutrientItem value={`${entry.mealData.totais.proteinas.toFixed(1)}g`} label="Proteínas" icon={Beef} colorClass="text-blue-500" />
              <NutrientItem value={`${entry.mealData.totais.carboidratos.toFixed(1)}g`} label="Carbs" icon={Wheat} colorClass="text-yellow-500" />
              <NutrientItem value={`${entry.mealData.totais.gorduras.toFixed(1)}g`} label="Gorduras" icon={Donut} colorClass="text-pink-500" />
            </div>
          </div>
        ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
