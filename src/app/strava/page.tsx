'use client';

import { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, HeartPulse, Zap } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { stravaSync } from '@/ai/flows/strava-sync-flow';
import type { StravaActivity } from '@/types/strava';
import StravaActivityCard from '@/components/strava-activity-card';

export default function StravaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
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
          router.push('/login');
        });

        return () => {
          unsubscribeProfile();
        };

      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router, toast]);

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfile };
    });
  }, []);

  const handleSync = async () => {
    if (!user) {
        toast({ title: "Usuário não encontrado", variant: 'destructive' });
        return;
    }
    setSyncing(true);
    setActivities([]); // Limpa as atividades anteriores antes de uma nova busca
    try {
      const syncedActivities = await stravaSync();
      
      setActivities(syncedActivities);

      toast({
        title: 'Sincronização Concluída! ✅',
        description: `Encontramos ${syncedActivities.length} novas atividades.`,
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
         <p className="mt-4 text-muted-foreground">Carregando suas atividades...</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minhas Atividades</h1>
            <p className="text-muted-foreground max-w-2xl mt-2">Suas atividades físicas importadas do Strava. Clique para buscar as atividades mais recentes.</p>
          </div>
          <Button onClick={handleSync} disabled={syncing} size="lg" className="shadow-md mt-4 sm:mt-0 shrink-0">
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Sincronizar com Strava
                </>
              )}
            </Button>
        </div>

        {activities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {activities.map(activity => (
              <StravaActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
           <Card className="max-w-2xl mx-auto shadow-sm rounded-2xl animate-fade-in mt-12" style={{animationDelay: '150ms'}}>
            <CardHeader className="text-center">
              <HeartPulse className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Nenhuma Atividade Carregada</CardTitle>
              <CardDescription>
                Clique no botão de sincronização para buscar e exibir suas atividades do Strava.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
      </div>
    </AppLayout>
  );
}
