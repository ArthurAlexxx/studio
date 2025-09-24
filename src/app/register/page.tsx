// src/app/register/page.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Leaf, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não correspondem.',
    path: ['confirmPassword'],
});

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleRegister = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
            data: {
                full_name: values.name,
            }
        }
      });

      if (error) throw error;
      if (error || !data.user) {
        throw new Error(error?.message || 'Não foi possível criar o usuário.');
      }
      
      // O gatilho no Supabase cuidará da criação do perfil.

      setSuccess(true);
      toast({
          title: "Registro realizado com sucesso!",
          description: "Você será redirecionado para o dashboard em instantes...",
      });
      
      // Aguarda um pouco e força o refresh da página para garantir a nova sessão
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);

    } catch (error: any) {
        toast({
            title: "Erro no registro",
            description: error.message || 'Ocorreu um erro durante o registro.',
            variant: "destructive"
        });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-foreground transition-colors hover:text-primary">
                <Leaf className="h-7 w-7 text-primary" />
                <span className="text-2xl font-bold">NutriSmart</span>
            </Link>
        </div>
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Crie sua Conta</CardTitle>
          <CardDescription>É rápido e fácil. Comece sua jornada saudável agora.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold text-foreground">Registro realizado com sucesso!</h3>
              <p className="text-muted-foreground">Você será redirecionado para o seu dashboard em instantes.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} disabled={loading} className="rounded-xl"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} disabled={loading} className="rounded-xl"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Mínimo de 6 caracteres" {...field} disabled={loading} className="rounded-xl"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Repita sua senha" {...field} disabled={loading} className="rounded-xl"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full !mt-8 rounded-xl" size="lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Criar Conta Gratuitamente
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex-col items-center gap-4">
           <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Faça login
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
