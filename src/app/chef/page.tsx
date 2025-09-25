// src/app/chef/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { chefVirtualFlow } from '@/ai/flows/chef-flow';


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
        const responseContent = await chefVirtualFlow({ prompt: input, userId: user.uid });
        
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Aqui está uma receita que encontrei para você:",
            recipe: responseContent,
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
