
'use server';
/**
 * @fileOverview A flow to synchronize Strava activities and save them to Firestore.
 *
 * - stravaSync - A function that triggers a webhook to fetch activities and saves them to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountString) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON não está definida.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Erro ao analisar as credenciais do Firebase. Verifique o formato da variável de ambiente.', error);
    throw new Error('Falha ao inicializar o Firebase Admin SDK.');
  }
}

const db = admin.firestore();

// Define the expected output schema from the flow itself
const StravaSyncOutputSchema = z.object({
    success: z.boolean(),
    syncedCount: z.number(),
});

export async function stravaSync(userId: string): Promise<z.infer<typeof StravaSyncOutputSchema>> {
  if (!userId) {
    throw new Error('User ID is required to sync Strava activities.');
  }
  return await stravaSyncFlow(userId);
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    inputSchema: z.string(), // Expecting userId as input
    outputSchema: StravaSyncOutputSchema,
  },
  async (userId) => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/f6a7bde1-c939-46ad-9d44-4d3251a48c0f';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to trigger webhook. Status: ${response.status}. Details: ${errorBody}`);
        throw new Error(`Failed to sync with Strava. Status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Access the array inside the "atividades" key
      const activitiesToProcess = responseData.atividades;

      if (!Array.isArray(activitiesToProcess)) {
        console.error('Webhook response did not contain an "atividades" array:', responseData);
        throw new Error('Webhook response is not in the expected format.');
      }

      const batch = db.batch();
      let syncedCount = 0;

      activitiesToProcess.forEach(activity => {
          if (activity && activity.id) {
              const activityRef = db.collection('users').doc(userId).collection('strava_activities').doc(String(activity.id));
              batch.set(activityRef, activity, { merge: true });
              syncedCount++;
          } else {
              console.warn('Skipping an item without an ID:', activity);
          }
      });
      
      if (syncedCount > 0) {
        await batch.commit();
      }

      return { success: true, syncedCount };

    } catch (error: any) {
      console.error('Error calling and processing data from Strava:', error);
      // Re-throw the error to be caught by the client-side caller
      throw new Error(`An error occurred while processing data from Strava: ${error.message}`);
    }
  }
);
