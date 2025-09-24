'use client';

import Image from 'next/image';
import Link from 'next/link';
import { aiPoweredRecipeSearch } from '@/ai/flows/ai-powered-recipe-search';
import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ExternalLink } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const initialState = {
  recipes: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Buscando...
        </>
      ) : (
        <>
          <Search className="mr-2 h-4 w-4" />
          Encontrar Receitas
        </>
      )}
    </Button>
  );
}

export default function RecipeSearchForm() {
  const [state, formAction] = useFormState(aiPoweredRecipeSearch, initialState);
  const placeholderRecipeImages = PlaceHolderImages.filter((img) => img.id.startsWith('recipe-'));

  return (
    <div className="w-full max-w-lg">
      <Card className="shadow-lg">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Chef Virtual</CardTitle>
            <CardDescription>
              Informe seus desejos e encontre a receita ideal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferences">Preferências e Restrições</Label>
              <Textarea
                id="preferences"
                name="preferences"
                placeholder="Ex: refeição rápida, sem glúten, para a família..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredientes Principais</Label>
              <Textarea
                id="ingredients"
                name="ingredients"
                placeholder="Ex: salmão, aspargos, batata doce..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisine">Tipo de Culinária (Opcional)</Label>
              <Input
                id="cuisine"
                name="cuisine"
                placeholder="Ex: italiana, tailandesa, brasileira..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      {state.recipes && state.recipes.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-headline text-2xl font-bold">Resultados da Busca:</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {state.recipes.map((recipe, index) => {
                const placeholder = placeholderRecipeImages[index % placeholderRecipeImages.length];
                return (
                  <Card key={index} className="overflow-hidden">
                    {placeholder && (
                      <Image
                        src={placeholder.imageUrl}
                        alt={recipe.title}
                        width={400}
                        height={300}
                        className="h-48 w-full object-cover"
                        data-ai-hint={placeholder.imageHint}
                      />
                    )}
                    <CardHeader>
                      <CardTitle className="font-headline text-lg">{recipe.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{recipe.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={recipe.url} target="_blank" rel="noopener noreferrer">
                          Ver Receita <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
            })}
          </div>
        </div>
      )}
    </div>
  );
}
