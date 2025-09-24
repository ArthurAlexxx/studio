// src/app/register/page.tsx
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Leaf, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-foreground transition-colors hover:text-primary">
                <Leaf className="h-7 w-7 text-primary" />
                <span className="text-2xl font-bold">NutriSmart</span>
            </Link>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Crie sua Conta</CardTitle>
          <CardDescription>É rápido e fácil. Comece sua jornada saudável agora.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center text-green-600">
              <p>Registro realizado com sucesso! Verifique seu e-mail para confirmar sua conta.</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Conta
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col items-center gap-2">
           <p className="text-xs text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Faça login
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
