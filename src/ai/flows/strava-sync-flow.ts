'use server';
/**
 * @fileOverview Um fluxo para sincronizar atividades do Strava.
 *
 * - stravaSync - Uma função que aciona um webhook para iniciar a sincronização e retorna as atividades.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/server'; // Usando server-side admin
import type { StravaActivity } from '@/types/strava';

const StravaSyncInputSchema = z.object({
  userId: z.string(),
});

type StravaSyncInput = z.infer<typeof StravaSyncInputSchema>;

export async function stravaSync(input: StravaSyncInput): Promise<void> {
  await stravaSyncFlow(input);
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    inputSchema: StravaSyncInputSchema,
    outputSchema: z.void(),
  },
  async ({ userId }) => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (response.ok) {
        let activities: StravaActivity[] = await response.json();
        
        // A API de teste pode retornar um array dentro de um array
        if (Array.isArray(activities) && activities.length > 0 && Array.isArray(activities[0])) {
            activities = activities[0]; 
        } else if (!Array.isArray(activities)) {
            // Se for um objeto único, transforma em array
            activities = [activities as any];
        }

        if (activities && activities.length > 0) {
            const batchPromises = activities.map(activity => {
                const activityRef = doc(db, 'users', userId, 'strava_activities', String(activity.id));
                return setDoc(activityRef, activity, { merge: true });
            });
            await Promise.all(batchPromises);
        }

      } else {
        const errorBody = await response.text();
        console.error(`Falha ao acionar o webhook. Status: ${response.status}. Detalhes: ${errorBody}`);
        throw new Error(`Falha na sincronização com o Strava. Status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Erro ao chamar e salvar dados do Strava:', error);
       throw new Error('Ocorreu um erro ao processar os dados do Strava.');
    }
  }
);
