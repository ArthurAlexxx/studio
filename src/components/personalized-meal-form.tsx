'use client';

import { personalizedMealRecommendations } from '@/ai/flows/personalized-meal-recommendations';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const initialState = {
  mealRecommendations: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar Recomendações
        </>
      )}
    </Button>
  );
}

export default function PersonalizedMealForm() {
  const [state, formAction] = useActionState(personalizedMealRecommendations, initialState);

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline">Seu Plano Perfeito</CardTitle>
          <CardDescription>
            Preencha os campos para receber suas recomendações personalizadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dietaryPreferences">Preferências Alimentares</Label>
            <Textarea
              id="dietaryPreferences"
              name="dietaryPreferences"
              placeholder="Ex: vegetariano, sem lactose, baixo carboidrato..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="healthGoals">Metas de Saúde</Label>
            <Textarea
              id="healthGoals"
              name="healthGoals"
              placeholder="Ex: perder peso, ganhar massa muscular, mais energia..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableIngredients">Ingredientes Disponíveis</Label>
            <Textarea
              id="availableIngredients"
              name="availableIngredients"
              placeholder="Ex: frango, brócolis, arroz, tomate, ovos..."
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
      {state.mealRecommendations && (
        <CardContent>
          <div className="mt-4 rounded-lg border bg-secondary/20 p-4">
            <h3 className="font-headline text-lg font-semibold">Suas Recomendações:</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
              {state.mealRecommendations}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
