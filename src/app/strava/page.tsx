'use client';

import { useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
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
          // We will set loading to false after activities are fetched
        }, () => {
          setLoading(false);
          router.push('/login');
        });

        // Listen for Strava activities in real-time
        const activitiesQuery = query(
          collection(db, 'users', currentUser.uid, 'strava_activities'),
          orderBy('data_inicio_local', 'desc')
        );

        const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
          const fetchedActivities = snapshot.docs.map(doc => doc.data() as StravaActivity);
          setActivities(fetchedActivities);
          setLoading(false); // Activities loaded
        }, (error) => {
          console.error("Error fetching Strava activities:", error);
          toast({ title: "Erro ao buscar atividades", description: "Não foi possível carregar suas atividades do Strava.", variant: "destructive" });
          setLoading(false);
        });

        return () => {
          unsubscribeProfile();
          unsubscribeActivities();
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
    try {
      await stravaSync({ userId: user.uid });
      
      toast({
        title: 'Sincronização Iniciada! ✅',
        description: `Buscando novas atividades. Elas aparecerão aqui em breve.`,
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
            <p className="text-muted-foreground max-w-2xl mt-2">Suas atividades físicas importadas do Strava. Clique para sincronizar novas atividades.</p>
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
              <CardTitle className="text-2xl">Nenhuma Atividade Encontrada</CardTitle>
              <CardDescription>
                Clique no botão de sincronização para buscar e salvar suas atividades do Strava. As calorias gastas em seus treinos serão contabilizadas em seu resumo diário.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        
      </div>
    </AppLayout>
  );
}
