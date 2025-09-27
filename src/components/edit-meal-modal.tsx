// src/components/edit-meal-modal.tsx
'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import { type MealEntry } from '@/types/meal';

const formSchema = z.object({
  calorias: z.coerce.number().min(0, 'As calorias não podem ser negativas.'),
  proteinas: z.coerce.number().min(0, 'As proteínas não podem ser negativas.'),
  carboidratos: z.coerce.number().min(0, 'Os carboidratos não podem ser negativos.'),
  gorduras: z.coerce.number().min(0, 'As gorduras não podem ser negativas.'),
});

type EditMealFormValues = z.infer<typeof formSchema>;

interface EditMealModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  mealEntry: MealEntry;
  onMealUpdate: (updatedMeal: MealEntry) => void;
}

export default function EditMealModal({ isOpen, onOpenChange, mealEntry, onMealUpdate }: EditMealModalProps) {
  const form = useForm<EditMealFormValues>({
    resolver: zodResolver(formSchema),
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (mealEntry) {
      form.reset({
        calorias: mealEntry.mealData.totais.calorias,
        proteinas: mealEntry.mealData.totais.proteinas,
        carboidratos: mealEntry.mealData.totais.carboidratos,
        gorduras: mealEntry.mealData.totais.gorduras,
      });
    }
  }, [mealEntry, form]);

  const onSubmit = (data: EditMealFormValues) => {
    const updatedMeal: MealEntry = {
      ...mealEntry,
      mealData: {
        ...mealEntry.mealData,
        totais: {
            ...mealEntry.mealData.totais,
            calorias: data.calorias,
            proteinas: data.proteinas,
            carboidratos: data.carboidratos,
            gorduras: data.gorduras,
        },
        // We mark the meal as manually edited
        alimentos: [{
            ...mealEntry.mealData.alimentos[0],
            nome: `(Editado) ${mealEntry.mealData.alimentos.map(f => f.nome).join(', ')}`.substring(0, 100),
            porcao: 1,
            unidade: 'porção'
        }]
      },
    };
    // Clear other foods if editing totals, to avoid confusion
    if (updatedMeal.mealData.alimentos.length > 1) {
       updatedMeal.mealData.alimentos = [updatedMeal.mealData.alimentos[0]];
    }

    onMealUpdate(updatedMeal);
  };

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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Valores da Refeição</DialogTitle>
          <DialogDescription>
            Ajuste os totais de macronutrientes para: <span className='font-semibold text-foreground'>{getMealTypeName(mealEntry.mealType)}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="calorias"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-semibold">Calorias (kcal)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="Ex: 500" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <FormField
                control={form.control}
                name="proteinas"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-semibold">Proteínas (g)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="Ex: 30" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="carboidratos"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-semibold">Carboidratos (g)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="Ex: 55" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="gorduras"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-semibold">Gorduras (g)</FormLabel>
                    <FormControl>
                        <Input type="number" step="any" placeholder="Ex: 20" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <DialogFooter className="!mt-8 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
