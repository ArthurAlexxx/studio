'use server';
/**
 * @fileOverview Um fluxo para sincronizar atividades do Strava.
 *
 * - stravaSync - Uma função que aciona um webhook para iniciar a sincronização e retorna as atividades.
 * - StravaSyncOutput - O tipo de retorno para a função stravaSync.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { StravaActivity } from '@/types/strava';

const StravaActivitySchema = z.object({
    id: z.number(),
    nome: z.string(),
    tipo: z.string(),
    sport_type: z.string(),
    distancia_km: z.number(),
    tempo_min: z.number(),
    elevacao_ganho: z.number(),
    data_inicio_local: z.string(),
});

export const StravaSyncOutputSchema = z.array(StravaActivitySchema);

export type StravaSyncOutput = z.infer<typeof StravaSyncOutputSchema>;

export async function stravaSync(): Promise<StravaSyncOutput> {
  return stravaSyncFlow();
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    inputSchema: z.void(),
    outputSchema: StravaSyncOutputSchema,
  },
  async () => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        // A API de teste retorna um array dentro de um array, então precisamos extrair
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            return data[0];
        }
        return data;
      } else {
        const errorBody = await response.text();
        console.error(`Falha ao acionar o webhook. Status: ${response.status}. Detalhes: ${errorBody}`);
        return [];
      }
    } catch (error: any) {
      console.error('Erro ao chamar o webhook do Strava:', error);
      return [];
    }
  }
);
