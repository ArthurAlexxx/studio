'use server';
/**
 * @fileOverview Um fluxo para sincronizar atividades do Strava.
 *
 * - stravaSync - Uma função que aciona um webhook para iniciar a sincronização e salva as atividades no Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
    // Inicialização do Firebase Admin SDK DENTRO do fluxo
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.', e);
            serviceAccount = undefined;
        }
    }


    if (!getApps().length) {
      initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : undefined,
      });
    }

    const db = getFirestore();
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (response.ok) {
        let activities: StravaActivity[] = await response.json();
        
        // O webhook pode retornar um array dentro de outro array
        if (Array.isArray(activities) && activities.length > 0 && Array.isArray(activities[0])) {
            activities = activities[0]; 
        } else if (!Array.isArray(activities)) {
            // Se a resposta for um único objeto, coloque-o em um array
            activities = [activities as any];
        }

        if (activities && activities.length > 0) {
            const batch = db.batch();
            activities.forEach(activity => {
                if (activity && activity.id) {
                    const activityRef = db.collection('users').doc(userId).collection('strava_activities').doc(String(activity.id));
                    batch.set(activityRef, activity, { merge: true });
                }
            });
            await batch.commit();
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
