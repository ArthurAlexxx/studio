'use server';
/**
 * @fileOverview A flow to synchronize Strava activities and save them to Firestore.
 *
 * - stravaSync - A function that triggers a webhook to fetch activities and saves them to the user's database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { StravaActivity } from '@/types/strava';

const StravaSyncInputSchema = z.object({
  userId: z.string().describe('The ID of the user to associate the activities with.'),
});
type StravaSyncInput = z.infer<typeof StravaSyncInputSchema>;

// The flow returns a count of synced activities.
const StravaSyncOutputSchema = z.object({
  syncedCount: z.number(),
});
type StravaSyncOutput = z.infer<typeof StravaSyncOutputSchema>;

export async function stravaSync(input: StravaSyncInput): Promise<StravaSyncOutput> {
  return await stravaSyncFlow(input);
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    inputSchema: StravaSyncInputSchema,
    outputSchema: StravaSyncOutputSchema,
  },
  async ({ userId }) => {
    let serviceAccount;
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        }
    } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e);
        throw new Error('Firebase service account key is not valid JSON.');
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

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to trigger webhook. Status: ${response.status}. Details: ${errorBody}`);
        throw new Error(`Failed to sync with Strava. Status: ${response.status}`);
      }

      let data = await response.json();
      
      let activities: StravaActivity[] = Array.isArray(data) && Array.isArray(data[0]) 
          ? data[0] 
          : Array.isArray(data)
          ? data
          : [data];

      if (!activities || activities.length === 0) {
        return { syncedCount: 0 };
      }
      
      const batch = db.batch();
      const userActivitiesRef = db.collection('users').doc(userId).collection('strava_activities');
      
      activities.forEach(activity => {
        const docRef = userActivitiesRef.doc(String(activity.id));
        batch.set(docRef, activity);
      });

      await batch.commit();

      return { syncedCount: activities.length };

    } catch (error: any) {
      console.error('Error calling and processing data from Strava:', error);
      throw new Error('An error occurred while processing data from Strava.');
    }
  }
);
