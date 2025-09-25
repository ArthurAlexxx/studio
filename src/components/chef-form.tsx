// src/components/chef-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  ingredients: z.string().min(3, { message: 'Informe pelo menos um ingrediente.' }),
  mealType: z.string().min(1, { message: 'Selecione o tipo de refeição.' }),
  preferences: z.string().optional(),
  optimize: z.boolean().default(false),
});

type ChefFormValues = z.infer<typeof formSchema>;

interface ChefFormProps {
  onGenerate: (data: ChefFormValues) => void;
  isGenerating: boolean;
}

export default function ChefForm({ onGenerate, isGenerating }: ChefFormProps) {
  const form = useForm<ChefFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: '',
      mealType: 'almoco',
      preferences: '',
      optimize: false,
    },
  });

  return (
    <Card className="shadow-sm rounded-2xl sticky top-24">
      <CardHeader>
        <CardTitle>Criar Receita</CardTitle>
        <CardDescription>Preencha os campos para gerar uma receita deliciosa e personalizada.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredientes Disponíveis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: peito de frango, tomate, cebola, arroz..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Refeição</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
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
            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferências ou Restrições</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: sem lactose, comida picante, rápida de fazer..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="optimize"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Otimizar para Metas</FormLabel>
                     <p className="text-[0.8rem] text-muted-foreground">
                       Gerar receita com base nas suas metas de calorias e macros.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Gerar Receita
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
