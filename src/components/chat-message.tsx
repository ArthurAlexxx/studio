
// src/components/chat-message.tsx
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChefHat, User } from 'lucide-react';
import type { Recipe } from '@/ai/flows/chef-flow';
import RecipeDisplay from './recipe-display';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipe?: Recipe;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex items-start gap-4 py-4', isAssistant ? '' : 'justify-end')}>
      <Avatar className={cn('h-10 w-10 border', isAssistant ? 'bg-primary/10 text-primary' : 'bg-secondary', !isAssistant && 'order-2')}>
        <AvatarFallback>
          {isAssistant ? <ChefHat className="h-6 w-6" /> : <User className="h-6 w-6" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        'max-w-xl lg:max-w-3xl rounded-2xl p-4',
        isAssistant ? 'bg-secondary rounded-tl-none' : 'bg-primary text-primary-foreground rounded-tr-none'
      )}>
        {message.content && <p className="text-base whitespace-pre-wrap">{message.content}</p>}
        {message.recipe && (
          <div className={cn(message.content && 'mt-4')}>
            <RecipeDisplay recipe={message.recipe} isGenerating={false} isChatMode={true} />
          </div>
        )}
      </div>
    </div>
  );
}


export const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Olá! Sou seu Chef Virtual. O que você gostaria de preparar hoje? Diga-me quais ingredientes você tem ou que tipo de prato está com vontade de comer.",
  },
];
