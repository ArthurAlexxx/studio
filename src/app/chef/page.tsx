// src/app/chef/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client';
import AppLayout from '@/components/app-layout';
import { Loader2, Sparkles, ChefHat } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import ChefForm from '@/components/chef-form';
import RecipeDisplay from '@/components/recipe-display';
import { chefVirtualFlow, type Recipe } from '@/ai/flows/chef-flow';

// Define meal percentages for goal optimization
const mealPercentages: Record<string, { calories: number; protein: number }> = {
  'cafe-da-manha': { calories: 0.25, protein: 0.25 },
  'almoco': { calories: 0.35, protein: 0.35 },
  'jantar': { calories: 0.30, protein: 0.30 },
  'lanche': { calories: 0.10, protein: 0.10 },
};

export default function ChefPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
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
        return () => unsubscribeProfile();
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleProfileUpdate = useCallback((updatedProfile: Partial<UserProfile>) => {
    setUserProfile(prevProfile => prevProfile ? { ...prevProfile, ...updatedProfile } : null);
  }, []);

  const handleGenerateRecipe = async (data: { ingredients: string; mealType: string; preferences: string; optimize: boolean }) => {
    setIsGenerating(true);
    setGeneratedRecipe(null);
    
    let flowInput: Parameters<typeof chefVirtualFlow>[0] = { ...data };

    if (data.optimize && userProfile) {
        const mealKey = data.mealType.toLowerCase();
        const percentages = mealPercentages[mealKey];

        if (percentages) {
            flowInput.targetCalories = Math.round(userProfile.calorieGoal * percentages.calories);
            flowInput.targetProtein = Math.round(userProfile.proteinGoal * percentages.protein);
        } else {
             toast({
                title: "Otimização não aplicável",
                description: "Não foi possível aplicar a otimização para este tipo de refeição.",
                variant: "destructive"
            });
        }
    }


    try {
      const recipe = await chefVirtualFlow(flowInput);
      setGeneratedRecipe(recipe);
      toast({
          title: "Receita Gerada! 🍳",
          description: "Sua nova receita está pronta para ser preparada."
      });
    } catch (error) {
       console.error("Failed to generate recipe:", error);
       toast({
         title: "Erro ao gerar receita",
         description: "Não foi possível conectar ao serviço. Por favor, tente novamente.",
         variant: "destructive"
       });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando o Chef Virtual...</p>
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
        <div className="mb-8 animate-fade-in text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full p-3 mb-4">
                <ChefHat className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Seu Chef Virtual com IA</h1>
            <p className="text-muted-foreground max-w-2xl mt-3 mx-auto">Sem inspiração para cozinhar? Diga-nos o que você tem na geladeira e deixe a mágica acontecer.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
                 <ChefForm onGenerate={handleGenerateRecipe} isGenerating={isGenerating} />
            </div>
             <div className="lg:col-span-8">
                <RecipeDisplay recipe={generatedRecipe} isGenerating={isGenerating} />
            </div>
        </div>
      </div>
    </AppLayout>
  );
}
