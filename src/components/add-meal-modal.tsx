// src/components/add-meal-modal.tsx
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MealData } from '@/types/meal';
import { createClient } from '@/lib/supabase/client';

const foodItemSchema = z.object({
  name: z.string().min(1, 'O nome do alimento é obrigatório.'),
  portion: z.coerce.number().min(1, 'A porção deve ser maior que 0.'),
  unit: z.string().min(1, 'A unidade é obrigatória.'),
});

const formSchema = z.object({
  mealType: z.string().min(1, 'O tipo de refeição é obrigatório.'),
  foods: z.array(foodItemSchema).min(1, 'Adicione pelo menos um alimento.'),
});

type AddMealFormValues = z.infer<typeof formSchema>;

interface AddMealModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onMealAdded: (mealData: MealData) => void;
  userId: string | null;
}

export default function AddMealModal({ isOpen, onOpenChange, onMealAdded, userId }: AddMealModalProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const form = useForm<AddMealFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mealType: '',
      foods: [{ name: '', portion: 0, unit: 'g' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'foods',
  });
  
  const { isSubmitting } = form.formState;

  const onSubmit = async (data: AddMealFormValues) => {
    if (!userId) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não identificado. A página será recarregada.",
        variant: "destructive"
      });
      setTimeout(() => window.location.reload(), 2000);
      return;
    }
    
    try {
      const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/d6381d21-a089-498f-8248-6d7802c0a1a5';
      const requests = data.foods.map(food => {
        const payload = {
          alimento: food.name,
          porcao: food.portion,
          unidade: food.unit,
        };
        return fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json();
            }
            return null; // Return null for non-json responses
        });
      });
      
      const results = (await Promise.all(requests)).flat().filter((r): r is MealData => r !== null);

      if (!results || results.length === 0) {
        toast({
          title: 'Nenhum dado nutricional retornado',
          description: 'O serviço não retornou informações para os alimentos informados.',
          variant: 'destructive',
        });
        return;
      }
      
      const combinedMealData: MealData = results.reduce((acc, meal) => {
        if (meal && meal.alimentos && meal.totais) {
            acc.alimentos.push(...meal.alimentos);
            acc.totais.calorias += meal.totais.calorias;
            acc.totais.proteinas += meal.totais.proteinas;
            acc.totais.carboidratos += meal.totais.carboidratos;
            acc.totais.gorduras += meal.totais.gorduras;
            acc.totais.fibras += meal.totais.fibras;
        }
        return acc;
      }, {
          alimentos: [],
          totais: { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, fibras: 0 }
      });
      

      const { error: dbError } = await supabase
        .from('meal_entries')
        .insert([{ 
            user_id: userId, 
            date: new Date().toISOString().split('T')[0],
            meal_type: data.mealType,
            meal_data: combinedMealData
        }]);

      if (dbError) throw dbError;

      onMealAdded(combinedMealData);

      toast({
        title: 'Refeição Adicionada!',
        description: 'Sua refeição foi registrada com sucesso.',
      });
      form.reset();
      onOpenChange(false);
    } catch(error: any) {
       console.error("Failed to submit meal", error);
        toast({
            title: "Erro ao adicionar refeição",
            description: error.message || "Não foi possível conectar ao servidor para adicionar sua refeição. Tente novamente.",
            variant: "destructive"
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Adicionar Nova Refeição</DialogTitle>
          <DialogDescription>
            Adicione os alimentos da sua refeição. Você pode incluir múltiplos alimentos (ex: peito de frango + arroz).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Tipo de Refeição *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo de refeição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cafe-da-manha">Café da Manhã</SelectItem>
                      <SelectItem value="almoco">Almoço</SelectItem>
                      <SelectItem value="jantar">Jantar</SelectItem>
                      <SelectItem value="lanche">Lanche</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Alimentos *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', portion: 0, unit: 'g' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Alimento
                </Button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border p-4 space-y-4 relative bg-secondary/30">
                     <p className="font-semibold text-sm text-muted-foreground">Alimento {index + 1}</p>
                    {fields.length > 1 && (
                         <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    <FormField
                      control={form.control}
                      name={`foods.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Alimento *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Peito de frango grelhado" {...field} />
                          </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`foods.${index}.portion`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Porção *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Ex: 150" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`foods.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unidade *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="g">g (gramas)</SelectItem>
                                <SelectItem value="ml">ml (mililitros)</SelectItem>
                                <SelectItem value="un">un (unidade)</SelectItem>
                                <SelectItem value="fatia">fatia</SelectItem>
                                <SelectItem value="xicara">xícara</SelectItem>
                                <SelectItem value="colher-sopa">colher de sopa</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                 <FormMessage>{form.formState.errors.foods?.message}</FormMessage>
              </div>
            </div>

            <DialogFooter className="!mt-8 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !userId}>
                 {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                Adicionar Refeição
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
