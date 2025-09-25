
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, collection, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client';
import AppLayout from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, HeartPulse, RefreshCw } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { stravaSync } from '@/ai/flows/strava-sync-flow';
import type { StravaActivity } from '@/types/strava';
import StravaActivityCard from '@/components/strava-activity-card';
import StravaStatsCards from '@/components/strava-stats-cards';
import StravaCharts from '@/components/strava-charts';
import { subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

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
          } else {
             setLoading(false);
             router.push('/login');
          }
        }, () => {
          setLoading(false);
          router.push('/login');
        });
        
        const activitiesQuery = query(collection(db, 'users', currentUser.uid, 'strava_activities'));
        const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
            const loadedActivities = snapshot.docs.map(d => d.data() as StravaActivity);
            loadedActivities.sort((a, b) => new Date(b.data_inicio_local).getTime() - new Date(a.data_inicio_local).getTime());
            setActivities(loadedActivities);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching activities:", error);
            setLoading(false);
             toast({
                title: "Erro ao Carregar Atividades",
                description: "Não foi possível carregar suas atividades salvas.",
                variant: "destructive"
             });
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
        toast({ title: "Usuário não autenticado", variant: 'destructive' });
        return;
    }
    setSyncing(true);
    try {
      const result = await stravaSync(user.uid);
      
      if (result.success) {
        toast({
            title: 'Sincronização Concluída!',
            description: `${result.syncedCount} atividades foram salvas com sucesso.`,
        });
      } else {
        throw new Error('A sincronização falhou no servidor.');
      }

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
  
  const weeklyChartData = useMemo(() => {
    const now = new Date();
    const last4Weeks = Array.from({ length: 4 }).map((_, i) => {
      const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      return {
        week: `Semana ${i}`,
        weekStart,
        weekEnd: endOfWeek(subWeeks(now, i), { weekStartsOn: 1 }),
        distance: 0,
      };
    }).reverse();

    activities.forEach(activity => {
      const activityDate = new Date(activity.data_inicio_local);
      for (const week of last4Weeks) {
        if (isWithinInterval(activityDate, { start: week.weekStart, end: week.weekEnd })) {
          week.distance += activity.distancia_km;
        }
      }
    });

    return last4Weeks.map(week => ({
      name: week.week,
      distance: parseFloat(week.distance.toFixed(1)),
    }));
  }, [activities]);

  const totalStats = useMemo(() => {
    return activities.reduce((acc, activity) => {
      acc.distance += activity.distancia_km;
      acc.time += activity.tempo_min;
      acc.elevation += activity.elevacao_ganho;
      return acc;
    }, { distance: 0, time: 0, elevation: 0 });
  }, [activities]);

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
        <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground">Análise de Atividades Físicas</h1>
            <p className="text-muted-foreground max-w-2xl mt-2">Suas estatísticas, progresso e histórico de atividades importadas do Strava.</p>
        </div>
        
        {activities.length > 0 && (
          <div className="space-y-8">
            <StravaStatsCards
              totalDistance={totalStats.distance}
              totalTime={totalStats.time}
              totalElevation={totalStats.elevation}
              totalActivities={activities.length}
            />
            <StravaCharts weeklyData={weeklyChartData} />
          </div>
        )}

        <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-foreground">Histórico de Atividades</h2>
                 <Button onClick={handleSync} disabled={syncing} variant="outline" className="shrink-0">
                    {syncing ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sincronizando...
                        </>
                    ) : (
                       'Sincronizar'
                    )}
                </Button>
            </div>
           
            {activities.length > 0 ? (
            <div className="flex flex-col gap-4 animate-fade-in">
                {activities.map(activity => (
                <StravaActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
            ) : !loading && (
            <Card className="max-w-2xl mx-auto shadow-sm rounded-2xl animate-fade-in mt-12" style={{animationDelay: '150ms'}}>
                <CardHeader className="text-center p-8">
                <HeartPulse className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-2xl">Nenhuma Atividade Encontrada</CardTitle>
                <CardDescription className="mt-2">
                    Clique no botão de sincronização para buscar e exibir suas atividades do Strava.
                </CardDescription>
                </CardHeader>
            </Card>
            )}
        </div>
        
      </div>
    </AppLayout>
  );
}
