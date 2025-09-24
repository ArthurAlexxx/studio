// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealEntry } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import DashboardMetrics from '@/components/dashboard-metrics';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export default function DashboardPage() {
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleMealAdded = useCallback(() => {
    // A lógica de atualização agora é tratada pelo onSnapshot
    toast({
        title: 'Refeição Adicionada! ✅',
        description: 'Sua refeição foi registrada com sucesso.',
    });
  }, [toast]);

  const handleMealDeleted = useCallback(async (entryId: string) => {
    if (!entryId) {
        toast({ title: "Erro", description: "ID da refeição não encontrado.", variant: "destructive" });
        return;
    }
    try {
        await deleteDoc(doc(db, "meal_entries", entryId));
        toast({
            title: "Refeição Removida",
            description: "A refeição foi removida com sucesso."
        });
    } catch(error: any) {
        toast({
            title: "Erro ao remover refeição",
            description: error.message || "Não foi possível remover a refeição.",
            variant: "destructive"
        });
    }
  }, [toast]);

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => {
        if (!prevProfile) return null;
        return { ...prevProfile, ...updatedProfile };
    });
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // --- Fetch User Profile and Update Streak ---
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let profileData: UserProfile;

          if (userDoc.exists()) {
            profileData = userDoc.data() as UserProfile;
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = profileData.lastLoginDate;

            if (lastLogin !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              
              if (lastLogin && differenceInCalendarDays(new Date(), parseISO(lastLogin)) === 1) {
                profileData.currentStreak = (profileData.currentStreak || 0) + 1;
              } else {
                profileData.currentStreak = 1;
              }
              profileData.lastLoginDate = today;

              await updateDoc(userDocRef, {
                currentStreak: profileData.currentStreak,
                lastLoginDate: profileData.lastLoginDate
              });
            }
          } else {
            profileData = {
              fullName: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              currentStreak: 1,
              lastLoginDate: new Date().toISOString().split('T')[0],
              calorieGoal: 2000,
              proteinGoal: 140,
            };
            await setDoc(userDocRef, profileData);
          }
          setUserProfile(profileData);

          // --- Setup Real-time Listener for Meals ---
          const today = new Date().toISOString().split('T')[0];
          const q = query(
            collection(db, "meal_entries"),
            where("userId", "==", currentUser.uid),
            where("date", "==", today)
          );
          
          const unsubscribeMeals = onSnapshot(q, (querySnapshot) => {
              const loadedEntries = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...(doc.data() as Omit<MealEntry, 'id'>)
              }));
              setMealEntries(loadedEntries);
              setLoading(false);
          }, (error) => {
              console.error("Error fetching meals in real-time:", error);
              toast({
                title: "Erro ao carregar refeições",
                description: "Não foi possível buscar suas refeições em tempo real.",
                variant: "destructive"
              });
              setLoading(false);
          });
          
          // Detach listener on cleanup
          return () => unsubscribeMeals();

        } catch (error: any) {
          toast({
            title: "Erro ao carregar dados",
            description: error.message || "Não foi possível buscar seus dados.",
            variant: "destructive"
          });
          setLoading(false);
        }
      } else {
        setUser(null);
        setMealEntries([]);
        setUserProfile(null);
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router, toast]);
  
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-gray-50 items-center justify-center">
         <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="mt-4 text-muted-foreground">Verificando sua sessão e carregando dados...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const mealsToday = mealEntries.map(entry => entry.mealData);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader 
        onMealAdded={handleMealAdded} 
        user={user} 
        userProfile={userProfile}
        onProfileUpdate={handleProfileUpdate}
      />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
              <>
                <DashboardMetrics meals={mealsToday} userProfile={userProfile} />
                <div className="mt-8">
                  <ConsumedFoodsList 
                    mealEntries={mealEntries} 
                    onMealDeleted={handleMealDeleted}
                  />
                </div>
              </>
        </div>
      </main>
    </div>
  );
}