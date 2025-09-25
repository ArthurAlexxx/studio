// src/components/recipe-display.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Utensils, Flame, Beef, Wheat, Donut, CheckSquare, Clock, Users, Soup } from 'lucide-react';

export interface Recipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

interface RecipeDisplayProps {
  recipe: Recipe | null;
  isGenerating: boolean;
}

const InfoBadge = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
    <Badge variant="outline" className="flex items-center gap-2 py-1 px-3 border-primary/20 bg-primary/5 text-primary">
        <Icon className="h-4 w-4" />
        <span className="font-medium">{text}</span>
    </Badge>
);

const NutrientItem = ({ value, label, icon: Icon, colorClass }: { value: string; label: string; icon: React.ElementType; colorClass?: string }) => (
  <div className="flex flex-col items-center text-center gap-1 rounded-lg p-3 bg-secondary/50">
    <Icon className={`h-6 w-6 mb-1 ${colorClass || 'text-muted-foreground'}`} />
    <p className={`text-lg font-bold ${colorClass || 'text-foreground'}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);


export default function RecipeDisplay({ recipe, isGenerating }: RecipeDisplayProps) {
  if (isGenerating) {
    return (
      <Card className="shadow-sm rounded-2xl min-h-[400px] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
        <CardTitle className="text-2xl">Seu Chef está pensando...</CardTitle>
        <CardDescription className="mt-2 max-w-sm">Criando uma receita incrível especialmente para você. Isso pode levar alguns segundos.</CardDescription>
      </Card>
    );
  }

  if (!recipe) {
    return (
        <Card className="shadow-sm rounded-2xl min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2">
            <Soup className="h-16 w-16 text-muted-foreground/50 mb-6" />
            <CardTitle className="text-2xl">Aguardando sua ideia</CardTitle>
            <CardDescription className="mt-2 max-w-xs">Preencha o formulário ao lado para que nosso Chef Virtual crie uma receita para você.</CardDescription>
        </Card>
    );
  }

  return (
    <Card className="shadow-sm rounded-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold">{recipe.title}</CardTitle>
        <CardDescription className="pt-1">{recipe.description}</CardDescription>
        <div className="flex flex-wrap items-center gap-3 pt-4">
            <InfoBadge icon={Clock} text={`${recipe.prepTime} preparo`} />
            <InfoBadge icon={Utensils} text={`${recipe.cookTime} cozimento`} />
            <InfoBadge icon={Users} text={`${recipe.servings} porções`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary" /> Ingredientes</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground pl-2">
                {recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>
        <Separator />
        <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Utensils className="h-5 w-5 text-primary" /> Modo de Preparo</h3>
            <ol className="list-decimal list-inside space-y-3 pl-2">
                {recipe.instructions.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
        </div>
        <Separator />
         <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /> Informação Nutricional</h3>
            <p className="text-sm text-muted-foreground mb-4">Valores aproximados por porção.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <NutrientItem value={recipe.nutrition.calories} label="Calorias" icon={Flame} colorClass="text-orange-500" />
                 <NutrientItem value={recipe.nutrition.protein} label="Proteínas" icon={Beef} colorClass="text-blue-500" />
                 <NutrientItem value={recipe.nutrition.carbs} label="Carboidratos" icon={Wheat} colorClass="text-yellow-500" />
                 <NutrientItem value={recipe.nutrition.fat} label="Gorduras" icon={Donut} colorClass="text-pink-500" />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
