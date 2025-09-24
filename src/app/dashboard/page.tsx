// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import ConsumedFoodsList from '@/components/consumed-foods-list';
import type { MealData } from '@/types/meal';
import type { UserProfile } from '@/types/user';
import DashboardMetrics from '@/components/dashboard-metrics';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase/client';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
                // Logged in yesterday, increment streak
                profileData.currentStreak = (profileData.currentStreak || 0) + 1;
              } else {
                // Didn't log in yesterday, reset streak
                profileData.currentStreak = 1;
              }
              profileData.lastLoginDate = today;

              // Update Firestore
              await updateDoc(userDocRef, {
                currentStreak: profileData.currentStreak,
                lastLoginDate: profileData.lastLoginDate
              });
            }
          } else {
            // Create profile if it doesn't exist (edge case)
            profileData = {
              fullName: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              currentStreak: 1,
              lastLoginDate: new Date().toISOString().split('T')[0],
            };
            await setDoc(userDocRef, profileData);
          }
          setUserProfile(profileData);

          // --- Fetch Meals ---
          const today = new Date().toISOString().split('T')[0];
          const q = query(
            collection(db, "meal_entries"),
            where("userId", "==", currentUser.uid),
            where("date", "==", today)
          );
          const querySnapshot = await getDocs(q);
          const loadedMeals = querySnapshot.docs.map(doc => doc.data().mealData as MealData);
          setMeals(loadedMeals);

        } catch (error: any) {
          toast({
            title: "Erro ao carregar dados",
            description: error.message || "Não foi possível buscar seus dados.",
            variant: "destructive"
          });
        }
      } else {
        setUser(null);
        setMeals([]);
        setUserProfile(null);
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleMealAdded = (newMealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, newMealData]);
  };
  
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onMealAdded={handleMealAdded} user={user} />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
              <>
                <DashboardMetrics meals={meals} userProfile={userProfile} />
                <div className="mt-8">
                  <ConsumedFoodsList meals={meals} />
                </div>
              </>
        </div>
      </main>
    </div>
  );
}
