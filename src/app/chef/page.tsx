
// src/app/chef/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client';
import AppLayout from '@/components/app-layout';
import { Loader2, ChefHat } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import ChatView from '@/components/chat-view';
import { type Message, initialMessages } from '@/components/chat-message';
import { chefVirtualFlow, type Recipe } from '@/ai/flows/chef-flow';
import RecipeDisplay from '@/components/recipe-display';
import { z } from 'zod';

const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
  servings: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  nutrition: z.object({
    calories: z.string(),
    protein: z.string(),
    carbs: z.string(),
    fat: z.string(),
  }),
});

// Helper to parse the raw text from the flow
const parseResponse = (responseText: string): { text: string; recipe?: Recipe } => {
  try {
    const data = JSON.parse(responseText);
    
    // Case 1: Response is an array like [{"output": "text and json..."}]
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      responseText = data[0].output; // Continue parsing with the inner content
    }
  } catch (e) {
    // It's likely a plain text response, so we let it pass to the next section
  }

  // Case 2: Response (or inner content) is a mix of text and a JSON object string
  const jsonStartIndex = responseText.indexOf('{');
  if (jsonStartIndex > 0) {
    const textPart = responseText.substring(0, jsonStartIndex).trim();
    const jsonPart = responseText.substring(jsonStartIndex);

    try {
      const parsedJson = JSON.parse(jsonPart);
      const parsedRecipe = RecipeSchema.safeParse(parsedJson);
      if (parsedRecipe.success) {
        return { text: textPart, recipe: parsedRecipe.data };
      }
    } catch (e) {
      // JSON part is invalid, return only the text part
      return { text: textPart };
    }
  }
  
  // Case 3: Response is a pure JSON object string (recipe, error, or simple output)
   try {
    const data = JSON.parse(responseText);
    const item = Array.isArray(data) ? data[0] : data;

    // It's a recipe
    const parsedRecipe = RecipeSchema.safeParse(item);
    if (parsedRecipe.success) {
      return { text: '', recipe: parsedRecipe.data };
    }

    // It's an error or conversational output
    if (item.erro) return { text: item.erro };
    if (item.output) return { text: item.output };
  } catch (e) {
    // Not a valid JSON, so treat as plain text.
  }

  // Case 4: Fallback for pure text or any other unhandled case
  return { text: responseText };
};


export default function ChefPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
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

  const handleSendMessage = async (input: string) => {
      if (!input.trim() || !user) return;

      const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);
      setIsResponding(true);

      try {
        const response = await chefVirtualFlow({ prompt: input, userId: user.uid });
        const { text, recipe } = parseResponse(response.text);
        
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: text || (recipe ? '' : "Não obtive uma resposta clara."),
            recipe: recipe,
        };
        
        setMessages(prev => [...prev, aiMessage]);

      } catch (error) {
          console.error("Failed to get AI response:", error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Desculpe, não consegui processar sua solicitação. Por favor, tente novamente."
          };
          setMessages(prev => [...prev, errorMessage]);
          toast({
              title: "Erro de Comunicação",
              description: "Não foi possível conectar ao Chef. Verifique sua conexão ou tente mais tarde.",
              variant: "destructive"
          });
      } finally {
          setIsResponding(false);
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
      <div className="flex flex-col h-full">
         <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
             <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full p-3 mb-4">
                <ChefHat className="h-10 w-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Converse com seu Chef IA</h1>
            <p className="text-muted-foreground max-w-2xl mt-3 mx-auto">Peça receitas, dicas de culinária ou faça alterações nos pratos. Sua imaginação é o limite.</p>
        </div>

        <ChatView
          messages={messages}
          isResponding={isResponding}
          onSendMessage={handleSendMessage}
        />
      </div>
    </AppLayout>
  );
}
