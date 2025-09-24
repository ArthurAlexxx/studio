'use client';

import Image from 'next/image';
import { Leaf, UtensilsCrossed, BarChart, ArrowRight, UserCheck, Sparkles, MessageCircle, TrendingUp, Dumbbell, Vegan, HeartPulse, Goal, Play, Star } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'feature-1');
  const howItWorksImage = PlaceHolderImages.find((img) => img.id === 'feature-2');
  const videoPlaceholderImage = PlaceHolderImages.find((img) => img.id === 'feature-3');
  
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-background py-24 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-8 animate-fade-in">
                <Badge variant="outline" className="w-fit border-primary/50 text-primary font-medium">Nutrição Inteligente e Personalizada</Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Revolucione sua Nutrição com IA
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl lg:text-lg">
                  O NutriSmart é seu assistente pessoal para uma vida mais saudável. Crie planos alimentares, descubra receitas e monitore seu progresso com o poder da inteligência artificial.
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                   <a href="/register" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-10 text-lg font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                      Começar Agora Gratuitamente
                      <ArrowRight className="ml-2 h-5 w-5" />
                   </a>
                </div>
                 <p className="text-sm text-muted-foreground">Economize tempo e alcance seus objetivos com planos gerados em segundos.</p>
              </div>
              <div className="relative h-80 w-full overflow-hidden rounded-2xl shadow-2xl lg:h-auto animate-fade-in" style={{animationDelay: '200ms'}}>
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

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="mb-16 text-center animate-fade-in">
               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Tudo que você precisa para uma vida saudável
              </h2>
              <p className="mx-auto mt-6 max-w-[700px] text-muted-foreground md:text-lg">
                Explore as ferramentas inteligentes que o NutriSmart oferece para simplificar sua jornada nutricional.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
               <div className="flex flex-col items-center text-center p-8 rounded-2xl transition-all hover:shadow-xl hover:scale-105 bg-card animate-fade-in border" style={{animationDelay: '200ms'}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Leaf className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Planos de Refeições Inteligentes</h3>
                  <p className="text-muted-foreground">Receba planos alimentares personalizados que se adaptam às suas metas, preferências e restrições alimentares.</p>
                </div>
                <div className="flex flex-col items-center text-center p-8 rounded-2xl transition-all hover:shadow-xl hover:scale-105 bg-card animate-fade-in border" style={{animationDelay: '400ms'}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UtensilsCrossed className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Chef Virtual com IA</h3>
                  <p className="text-muted-foreground">Descubra milhares de receitas deliciosas com base nos ingredientes que você tem em casa. Chega de desperdício!</p>
                </div>
                <div className="flex flex-col items-center text-center p-8 rounded-2xl transition-all hover:shadow-xl hover:scale-105 bg-card animate-fade-in border" style={{animationDelay: '600ms'}}>
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BarChart className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Dashboard de Progresso</h3>
                  <p className="text-muted-foreground">Acompanhe sua evolução com gráficos intuitivos de calorias, macronutrientes e outros dados importantes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-20 md:py-28 bg-background">
          <div className="container px-4 md:px-6">
             <div className="mb-16 text-center animate-fade-in">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Como Funciona o NutriSmart
              </h2>
              <p className="mx-auto mt-6 max-w-[700px] text-muted-foreground md:text-lg">
                Transforme sua rotina alimentar em apenas 4 passos simples.
              </p>
            </div>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <div className="relative h-96 w-full overflow-hidden rounded-2xl shadow-xl animate-fade-in" style={{animationDelay: '200ms'}}>
                    {howItWorksImage && (
                        <Image
                            src={howItWorksImage.imageUrl}
                            alt={howItWorksImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={howItWorksImage.imageHint}
                        />
                    )}
                </div>
                <div className="space-y-8">
                    {[
                        { icon: UserCheck, title: 'Crie seu Perfil', description: 'Defina suas metas, restrições e preferências alimentares.' },
                        { icon: Sparkles, title: 'Receba Planos com IA', description: 'Nossa IA gera planos alimentares personalizados para você.' },
                        { icon: MessageCircle, title: 'Converse com o Assistente', description: 'Tire dúvidas e receba dicas com nosso chatbot inteligente.' },
                        { icon: TrendingUp, title: 'Acompanhe seu Progresso', description: 'Visualize sua evolução com gráficos e indicadores de saúde.' },
                    ].map((step, index) => (
                        <div key={step.title} className="flex items-start gap-6 animate-fade-in pt-4" style={{ animationDelay: `${400 + 200 * index}ms` }}>
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">{index + 1}</div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* Who it's for Section */}
        <section id="who-its-for" className="py-20 md:py-28 bg-muted/20">
            <div className="container px-4 md:px-6">
                <div className="mb-16 text-center animate-fade-in">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Feito para a sua jornada
                    </h2>
                    <p className="mx-auto mt-6 max-w-[700px] text-muted-foreground md:text-lg">
                       Seja qual for seu objetivo, o NutriSmart se adapta a você.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { icon: Dumbbell, title: 'Atletas', description: 'Performance e recuperação com nutrição otimizada.' },
                        { icon: Vegan, title: 'Vegetarianos e Veganos', description: 'Equilíbrio e variedade em dietas baseadas em plantas.' },
                        { icon: HeartPulse, title: 'Pessoas com Restrições', description: 'Planos seguros para intolerâncias e alergias.' },
                        { icon: Goal, title: 'Controle de Peso', description: 'Emagrecimento ou ganho de massa com acompanhamento.' },
                    ].map((profile, index) => (
                        <Card key={profile.title} className="text-center p-8 transition-all hover:shadow-2xl hover:-translate-y-2 animate-fade-in bg-card" style={{ animationDelay: `${200 * (index + 1)}ms` }}>
                            <div className="mb-4 flex justify-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <profile.icon className="h-8 w-8" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{profile.title}</h3>
                            <p className="text-muted-foreground">{profile.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* Video Section */}
        <section className="py-20 md:py-28 bg-background">
            <div className="container px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                    Veja o NutriSmart em Ação
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mb-12">
                   Descubra em menos de 2 minutos como nossa plataforma pode transformar sua alimentação.
                </p>
                <div className="relative mx-auto max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl group animate-fade-in">
                    {videoPlaceholderImage && (
                        <Image src={videoPlaceholderImage.imageUrl} alt="Demonstração do NutriSmart" fill objectFit="cover" data-ai-hint={videoPlaceholderImage.imageHint} />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm transition-all group-hover:bg-primary group-hover:scale-110">
                            <Play className="h-10 w-10 text-primary-foreground ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials & Results Section */}
        <section id="testimonials" className="py-20 md:py-28 bg-muted/20">
            <div className="container px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <Badge variant="outline" className="w-fit border-primary/50 text-primary font-medium mb-6">O que nossos usuários dizem</Badge>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-8">
                           Resultados que falam por si
                        </h2>
                        <div className="space-y-8">
                            <Card className="p-6 shadow-lg bg-card">
                                <CardContent className="p-0">
                                    <div className="flex items-center mb-2">
                                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />)}
                                    </div>
                                    <blockquote className="text-lg text-foreground italic">"O NutriSmart mudou minha relação com a comida. Nunca foi tão fácil comer bem!"</blockquote>
                                    <p className="mt-4 font-semibold text-right">- Juliana M., usuária desde 2023</p>
                                </CardContent>
                            </Card>
                             <Card className="p-6 shadow-lg bg-card">
                                <CardContent className="p-0">
                                     <div className="flex items-center mb-2">
                                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < 5 ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />)}
                                    </div>
                                    <blockquote className="text-lg text-foreground italic">"A IA entende minhas necessidades melhor que qualquer app que já usei."</blockquote>
                                    <p className="mt-4 font-semibold text-right">- Carlos T., triatleta amador</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="bg-card p-10 rounded-2xl shadow-xl">
                        <h3 className="text-2xl font-bold mb-6 text-center">Resultados Comprovados</h3>
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-primary">25.000+</p>
                                <p className="text-muted-foreground">Usuários ativos e satisfeitos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-5xl font-bold text-primary">92%</p>
                                <p className="text-muted-foreground">Relatam melhora na alimentação em 30 dias</p>
                            </div>
                            <div className="text-center">
                                <p className="text-5xl font-bold text-primary">4.8/5</p>
                                <p className="text-muted-foreground">É a nossa avaliação média na plataforma</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
