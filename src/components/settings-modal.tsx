// src/components/settings-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type UserProfile } from '@/types/user';
import { db } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  calorieGoal: z.coerce.number().min(1, 'A meta de calorias deve ser maior que 0.'),
  proteinGoal: z.coerce.number().min(1, 'A meta de proteínas deve ser maior que 0.'),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userProfile: UserProfile;
  userId: string;
  onProfileUpdate: (updatedProfile: Partial<UserProfile>) => void;
}

export default function SettingsModal({ isOpen, onOpenChange, userProfile, userId, onProfileUpdate }: SettingsModalProps) {
  const { toast } = useToast();
  const [autoCalculate, setAutoCalculate] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calorieGoal: userProfile.calorieGoal || 2000,
      proteinGoal: userProfile.proteinGoal || 140,
    },
  });
  
  const { isSubmitting } = form.formState;
  const calorieGoal = form.watch('calorieGoal');

  useEffect(() => {
    if (autoCalculate) {
      const calculatedProtein = Math.round((calorieGoal * 0.30) / 4);
      form.setValue('proteinGoal', calculatedProtein > 0 ? calculatedProtein : 1);
    }
  }, [calorieGoal, autoCalculate, form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        calorieGoal: data.calorieGoal,
        proteinGoal: data.proteinGoal,
      });

      onProfileUpdate(data);

      toast({
        title: 'Metas Atualizadas!',
        description: 'Suas metas diárias foram salvas com sucesso.',
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar metas",
        description: error.message || "Não foi possível salvar suas metas. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Definir Metas Diárias</DialogTitle>
          <DialogDescription>
            Personalize suas metas ou deixe que o app calcule a proteína para você.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="calorieGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Meta de Calorias (kcal)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 2200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                    <FormLabel className="font-semibold">Calcular proteína automaticamente</FormLabel>
                    <p className="text-xs text-muted-foreground">Calcula 30% das calorias (recomendado 10-35%)</p>
                </div>
                <Switch
                    checked={autoCalculate}
                    onCheckedChange={setAutoCalculate}
                />
            </div>

            <FormField
              control={form.control}
              name="proteinGoal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Meta de Proteínas (g)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 150" {...field} disabled={autoCalculate} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Salvar Metas
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
