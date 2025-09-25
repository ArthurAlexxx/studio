
'use server';
/**
 * @fileOverview A flow to synchronize Strava activities and return them.
 *
 * - stravaSync - A function that triggers a webhook to fetch activities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { StravaActivity } from '@/types/strava';

const StravaSyncOutputSchema = z.array(z.any());

export async function stravaSync(): Promise<z.infer<typeof StravaSyncOutputSchema>> {
  return await stravaSyncFlow();
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    outputSchema: StravaSyncOutputSchema,
  },
  async () => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Failed to trigger webhook. Status: ${response.status}. Details: ${errorBody}`);
        throw new Error(`Failed to sync with Strava. Status: ${response.status}`);
      }

      const activities: StravaActivity[] = await response.json();
      console.log('Atividades recebidas do webhook:', activities);
      
      return activities;

    } catch (error: any) {
      console.error('Error calling and processing data from Strava:', error);
      throw new Error('An error occurred while processing data from Strava.');
    }
  }
);
