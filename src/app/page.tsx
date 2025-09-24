import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Dumbbell, HeartPulse, Leaf, UtensilsCrossed } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/header';
import Footer from '@/components/footer';
import PersonalizedMealForm from '@/components/personalized-meal-form';
import RecipeSearchForm from '@/components/recipe-search-form';
import { ProgressDashboard } from '@/components/progress-dashboard';
import { ContactForm } from '@/components/contact-form';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[80vh] min-h-[600px] w-full pt-12 md:pt-24 lg:pt-32">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20" />
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Bem-vindo ao NutriSmart
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-foreground/80 md:text-xl">
              Sua jornada para uma vida mais saudável, guiada por inteligência artificial.
            </p>
            <div className="mt-6">
              <Button size="lg" asChild>
                <a href="#features">Comece Agora</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="bg-background">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Funcionalidades Inteligentes
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-foreground/80 md:text-lg">
                Ferramentas poderosas para transformar sua nutrição e alcançar seus objetivos de saúde.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col items-center p-6 text-center shadow-lg">
                <CardHeader className="p-0">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Leaf className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <CardTitle className="font-headline text-xl font-semibold">Recomendações Personalizadas</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <p className="text-foreground/80">Receba planos de refeições feitos sob medida pela nossa IA, com base em suas metas e preferências.</p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center shadow-lg">
                <CardHeader className="p-0">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <UtensilsCrossed className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <CardTitle className="font-headline text-xl font-semibold">Busca de Receitas com IA</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <p className="text-foreground/80">Encontre receitas deliciosas e saudáveis que se encaixam perfeitamente na sua dieta.</p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center p-6 text-center shadow-lg">
                <CardHeader className="p-0">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <BarChart className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <CardTitle className="font-headline text-xl font-semibold">Dashboard de Progresso</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <p className="text-foreground/80">Acompanhe sua evolução com gráficos interativos e resumos visuais do seu consumo.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section id="meal-planner" className="bg-card">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Planejador de Refeições IA</h2>
              <p className="max-w-[600px] text-foreground/80 md:text-lg">
                Deixe nossa inteligência artificial criar um plano de refeições delicioso e equilibrado para você. Informe suas preferências, metas e os ingredientes que você tem em casa.
              </p>
            </div>
            <PersonalizedMealForm />
          </div>
        </section>

        <section id="recipe-search" className="bg-background">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
             <div className="order-2 lg:order-1">
               <RecipeSearchForm />
            </div>
            <div className="order-1 lg:order-2 space-y-4 lg:text-right">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Encontre a Receita Perfeita</h2>
              <p className="mx-auto max-w-[600px] text-foreground/80 md:text-lg lg:ml-auto">
                Está sem inspiração? Descreva o que você gostaria de comer, seus ingredientes e restrições, e nossa IA encontrará as melhores receitas da internet para você.
              </p>
            </div>
          </div>
        </section>

        <section id="dashboard" className="bg-card">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
                Seu Progresso em um Olhar
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-foreground/80 md:text-lg">
                Visualize seu consumo de calorias, distribuição de macronutrientes e muito mais. Mantenha-se motivado e no caminho certo para seus objetivos.
              </p>
            </div>
            <ProgressDashboard />
          </div>
        </section>
        
        <section id="contact" className="border-t">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Fale Conosco</h2>
              <p className="max-w-[600px] text-foreground/80 md:text-lg">
                Tem alguma dúvida, sugestão ou feedback? Adoraríamos ouvir de você. Preencha o formulário e nossa equipe entrará em contato.
              </p>
            </div>
            <ContactForm />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
