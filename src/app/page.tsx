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
        <section className="py-24 md:py-32 lg:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-6 animate-fade-in">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Revolucione sua Nutrição com IA
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  O NutriSmart é seu assistente pessoal para uma vida mais saudável. Crie planos alimentares, descubra receitas e monitore seu progresso com o poder da inteligência artificial.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                   <a href="/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-transform hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                      Começar Agora
                      <ArrowRight className="ml-2 h-5 w-5" />
                   </a>
                </div>
              </div>
              <div className="relative h-64 w-full overflow-hidden rounded-2xl lg:h-auto animate-fade-in" style={{animationDelay: '200ms'}}>
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
            <div className="mb-16 text-center animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tudo que você precisa para uma vida saudável
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-lg">
                Explore as ferramentas inteligentes que o NutriSmart oferece para simplificar sua jornada nutricional.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
               <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all hover:shadow-xl hover:scale-105 bg-card animate-fade-in" style={{animationDelay: '200ms'}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Leaf className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Planos de Refeições Inteligentes</h3>
                  <p className="text-muted-foreground">Receba planos alimentares personalizados que se adaptam às suas metas, preferências e restrições alimentares.</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all hover:shadow-xl hover:scale-105 bg-card animate-fade-in" style={{animationDelay: '400ms'}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UtensilsCrossed className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Chef Virtual com IA</h3>
                  <p className="text-muted-foreground">Descubra milhares de receitas deliciosas com base nos ingredientes que você tem em casa. Chega de desperdício!</p>
                </div>
                <div className="flex flex-col items-center text-center p-6 rounded-2xl transition-all hover:shadow-xl hover:scale-105 bg-card animate-fade-in" style={{animationDelay: '600ms'}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Dashboard de Progresso</h3>
                  <p className="text-muted-foreground">Acompanhe sua evolução com gráficos intuitivos de calorias, macronutrientes e outros dados importantes.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
