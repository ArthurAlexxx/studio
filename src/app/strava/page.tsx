// src/app/strava/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, HeartPulse } from 'lucide-react';
import type { UserProfile } from '@/types/user';

export default function StravaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserProfile(doc.data() as UserProfile);
          }
          setLoading(false);
        }, () => {
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfile };
    });
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (!response.ok) {
        throw new Error('A resposta da sincronização não foi bem-sucedida.');
      }

      toast({
        title: 'Sincronização Iniciada! ✅',
        description: 'Suas atividades do Strava serão importadas em breve.',
      });

    } catch (error: any) {
      console.error("Strava sync error:", error);
      toast({
        title: 'Erro na Sincronização',
        description: error.message || 'Não foi possível conectar com o serviço do Strava.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <AppLayout
        user={user}
        userProfile={userProfile}
        onMealAdded={() => {}}
        onProfileUpdate={handleProfileUpdate}
    >
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Sincronizar com Strava</h1>
          <p className="text-muted-foreground">Conecte sua conta do Strava para importar suas atividades físicas e obter uma visão completa do seu balanço calórico.</p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-sm rounded-2xl animate-fade-in" style={{animationDelay: '150ms'}}>
          <CardHeader className="text-center">
            <HeartPulse className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Importar Atividades</CardTitle>
            <CardDescription>
              Clique no botão abaixo para buscar suas atividades recentes do Strava. As calorias gastas em seus treinos serão contabilizadas em seu resumo diário.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleSync} disabled={syncing} size="lg" className="shadow-md">
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                'Sincronizar com Strava'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}