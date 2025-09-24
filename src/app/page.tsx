import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, UtensilsCrossed, BarChart, CheckCircle, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image-1');
  const feature1Image = PlaceHolderImages.find((img) => img.id === 'feature-1');
  const feature2Image = PlaceHolderImages.find((img) => img.id === 'feature-2');
  const feature3Image = PlaceHolderImages.find((img) => img.id === 'feature-3');
  
  const testimonials = [
    {
      quote: "O NutriSmart transformou minha relação com a comida. As recomendações são incríveis e fáceis de seguir!",
      author: "Ana Silva",
      role: "Usuária Satisfeita"
    },
    {
      quote: "Finalmente encontrei um app que entende minhas metas de saúde e me ajuda a alcançá-las com receitas deliciosas.",
      author: "Carlos Souza",
      role: "Entusiasta Fitness"
    },
     {
      quote: "O design é lindo e a IA é super inteligente. Planejar minhas refeições nunca foi tão simples e prazeroso.",
      author: "Juliana Pereira",
      role: "Designer de Produto"
    }
  ];

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
                  <Button size="lg" asChild>
                    <a href="#features">
                      Descubra os Benefícios
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
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
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="items-center p-0">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Leaf className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Planos de Refeições Inteligentes</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 text-center">
                  <p className="text-muted-foreground">Receba planos alimentares personalizados que se adaptam às suas metas, preferências e restrições alimentares.</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="items-center p-0">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <UtensilsCrossed className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Chef Virtual com IA</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 text-center">
                  <p className="text-muted-foreground">Descubra milhares de receitas deliciosas com base nos ingredientes que você tem em casa. Chega de desperdício!</p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader className="items-center p-0">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BarChart className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Dashboard de Progresso</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 text-center">
                  <p className="text-muted-foreground">Acompanhe sua evolução com gráficos intuitivos de calorias, macronutrientes e outros dados importantes.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="how-it-works">
           <div className="container px-4 md:px-6">
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                 <div className="relative h-80 w-full overflow-hidden rounded-xl lg:h-auto">
                    {feature1Image && <Image src={feature1Image.imageUrl} alt={feature1Image.description} layout="fill" objectFit="cover" data-ai-hint={feature1Image.imageHint} />}
                 </div>
                 <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                       <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Passo 1</div>
                       <h3 className="text-2xl font-bold">Defina Suas Metas</h3>
                       <p className="text-muted-foreground">Informe seus objetivos, seja perder peso, ganhar massa muscular ou simplesmente ter mais energia e disposição no dia a dia.</p>
                    </div>
                 </div>
              </div>
              <div className="mt-10 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
                 <div className="flex flex-col justify-center space-y-4 lg:order-2">
                     <div className="space-y-2">
                       <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Passo 2</div>
                       <h3 className="text-2xl font-bold">Receba Recomendações</h3>
                       <p className="text-muted-foreground">Nossa IA analisa seu perfil e cria um plano de refeições e receitas deliciosas, totalmente personalizadas para você.</p>
                    </div>
                 </div>
                 <div className="relative h-80 w-full overflow-hidden rounded-xl lg:order-1 lg:h-auto">
                    {feature2Image && <Image src={feature2Image.imageUrl} alt={feature2Image.description} layout="fill" objectFit="cover" data-ai-hint={feature2Image.imageHint} />}
                 </div>
              </div>
               <div className="mt-10 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
                 <div className="relative h-80 w-full overflow-hidden rounded-xl lg:h-auto">
                    {feature3Image && <Image src={feature3Image.imageUrl} alt={feature3Image.description} layout="fill" objectFit="cover" data-ai-hint={feature3Image.imageHint} />}
                 </div>
                 <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                       <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Passo 3</div>
                       <h3 className="text-2xl font-bold">Acompanhe Seu Sucesso</h3>
                       <p className="text-muted-foreground">Use nosso dashboard interativo para visualizar seu progresso e se manter motivado em sua jornada para uma vida mais saudável.</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>
        
        <section id="pricing" className="bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Um Plano Simples para Todos</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Tenha acesso a todos os recursos premium com um único plano, sem complicações.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-md">
              <Card className="rounded-xl shadow-2xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">Plano Pro</CardTitle>
                  <p className="text-4xl font-extrabold">R$19,90<span className="text-xl font-normal text-muted-foreground">/mês</span></p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Planos de refeições ilimitados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Busca de receitas com IA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Dashboard de progresso completo</span>
                    </li>
                     <li className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                  <Button size="lg" className="w-full">
                    Começar Agora
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="testimonials">
          <div className="container px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Amado por Nossos Usuários
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col justify-between p-6 shadow-lg">
                  <CardContent className="p-0">
                    <p className="text-muted-foreground">"{testimonial.quote}"</p>
                  </CardContent>
                  <div className="mt-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
