import Image from 'next/image';
import { Leaf, UtensilsCrossed, BarChart, ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');
  
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Revolucione sua Nutrição com IA
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  O NutriSmart é seu assistente pessoal para uma vida mais saudável. Crie planos alimentares, descubra receitas e monitore seu progresso com o poder da inteligência artificial.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <a href="/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                   </a>
                </div>
              </div>
              <div className="relative h-64 w-full overflow-hidden rounded-xl lg:h-auto">
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
               </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tudo que você precisa para uma vida saudável
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-lg">
                Explore as ferramentas inteligentes que o NutriSmart oferece para simplificar sua jornada nutricional.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
               <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Leaf className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Planos de Refeições Inteligentes</h3>
                  <p className="mt-2 text-muted-foreground">Receba planos alimentares personalizados que se adaptam às suas metas, preferências e restrições alimentares.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <UtensilsCrossed className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Chef Virtual com IA</h3>
                  <p className="mt-2 text-muted-foreground">Descubra milhares de receitas deliciosas com base nos ingredientes que você tem em casa. Chega de desperdício!</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BarChart className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Dashboard de Progresso</h3>
                  <p className="mt-2 text-muted-foreground">Acompanhe sua evolução com gráficos intuitivos de calorias, macronutrientes e outros dados importantes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
