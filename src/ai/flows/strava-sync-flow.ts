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

// Import the service account key from the dedicated file
import serviceAccountJson from '@/lib/firebase/service-account.json';

const StravaSyncInputSchema = z.object({
  userId: z.string().describe('The ID of the user to associate the activities with.'),
});
type StravaSyncInput = z.infer<typeof StravaSyncInputSchema>;

const StravaSyncOutputSchema = z.object({
  syncedCount: z.number(),
});

export async function stravaSync(input: StravaSyncInput): Promise<z.infer<typeof StravaSyncOutputSchema>> {
  return await stravaSyncFlow(input);
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    inputSchema: StravaSyncInputSchema,
    outputSchema: StravaSyncOutputSchema,
  },
  async ({ userId }) => {
    // Initialize Firebase Admin SDK within the flow
    if (!getApps().length) {
      const serviceAccount = serviceAccountJson as any;
      initializeApp({
        credential: cert(serviceAccount),
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

      const data = await response.json();
      
      // Ensure data is an array
      const activities: StravaActivity[] = Array.isArray(data) ? data : [data];

      if (!activities || activities.length === 0) {
        return { syncedCount: 0 };
      }
      
      const batch = db.batch();
      const userActivitiesRef = db.collection('users').doc(userId).collection('strava_activities');
      
      activities.forEach(activity => {
        // Ensure activity and activity.id are valid before creating a doc
        if (activity && activity.id) {
            const docRef = userActivitiesRef.doc(String(activity.id));
            batch.set(docRef, activity);
        }
      });

      await batch.commit();

      return { syncedCount: activities.length };

    } catch (error: any) {
      console.error('Error calling and processing data from Strava:', error);
      throw new Error('An error occurred while processing data from Strava.');
    }
  }
);
