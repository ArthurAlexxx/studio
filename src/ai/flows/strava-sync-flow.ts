
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
import serviceAccount from '@/lib/firebase/service-account.json';
import type { StravaActivity } from '@/types/strava';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
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
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to trigger webhook. Status: ${response.status}. Details: ${errorBody}`);
        throw new Error(`Failed to sync with Strava. Status: ${response.status}`);
      }
      
      const activitiesData: StravaActivity[] = await response.json();
      
      const batch = db.batch();
      let syncedCount = 0;

      activitiesData.forEach(activity => {
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
