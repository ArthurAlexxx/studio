'use client';

import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import React from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      Enviar Mensagem
    </Button>
  );
}

export function ContactForm() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleAction(formData: FormData) {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
    });
    
    toast({
      title: "Mensagem Enviada!",
      description: "Obrigado pelo seu contato. Responderemos em breve.",
    });
    formRef.current?.reset();
  }

  return (
    <Card className="w-full max-w-lg shadow-lg">
      <form ref={formRef} action={handleAction}>
        <CardHeader>
          <CardTitle className="font-headline">Formulário de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Seu nome" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" name="message" placeholder="Sua mensagem..." required />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
