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
import RecipeDisplay, { type Recipe } from '@/components/recipe-display';

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
    
    try {
      const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/d6381d21-a089-498f-8248-6d7802c0a1a5';
      const payload = {
        action: 'chef',
        ...data
      };

      const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });

      if (response.ok) {
        const recipeFromWebhook = await response.json();
        setGeneratedRecipe(recipeFromWebhook);
        toast({
            title: "Receita Gerada! 🍳",
            description: "Sua nova receita está pronta para ser preparada."
        });
      } else {
         const errorText = await response.text();
         console.error("Failed to generate recipe from webhook:", errorText);
         throw new Error("A resposta do webhook não foi bem-sucedida.");
      }
    } catch (error) {
       console.error("Failed to generate recipe:", error);
       toast({
         title: "Erro ao gerar receita",
         description: "Não foi possível conectar ao serviço. Por favor, tente novamente.",
         variant: "destructive"
       });
       // Opcional: pode-se remover o fallback ou mantê-lo para debug
       const fallbackRecipe: Recipe = {
          title: 'Macarrão ao alho e óleo (Fallback)',
          description: 'Uma receita simples e rápida para quando a criatividade falha.',
          prepTime: '5 min', cookTime: '15 min', servings: '1',
          ingredients: ['100g de macarrão', '2 dentes de alho', 'Azeite', 'Sal e pimenta'],
          instructions: ['Cozinhe o macarrão.', 'Frite o alho no azeite.', 'Misture tudo e sirva.'],
          nutrition: { calories: '400 kcal', protein: '12g', carbs: '70g', fat: '8g' }
       };
       setGeneratedRecipe(fallbackRecipe);
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
