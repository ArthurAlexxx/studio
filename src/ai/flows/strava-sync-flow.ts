'use server';
/**
 * @fileOverview Um fluxo para sincronizar atividades do Strava.
 *
 * - stravaSync - Uma função que aciona um webhook para buscar as atividades.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { StravaActivity } from '@/types/strava';

const StravaSyncInputSchema = z.object({});
type StravaSyncInput = z.infer<typeof StravaSyncInputSchema>;

// Definindo o esquema para uma única atividade para garantir a consistência dos dados
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

// O fluxo retorna um array de atividades
const StravaSyncOutputSchema = z.array(StravaActivitySchema);
type StravaSyncOutput = z.infer<typeof StravaSyncOutputSchema>;

export async function stravaSync(input?: StravaSyncInput): Promise<StravaSyncOutput> {
  return await stravaSyncFlow(input || {});
}

const stravaSyncFlow = ai.defineFlow(
  {
    name: 'stravaSyncFlow',
    inputSchema: StravaSyncInputSchema,
    outputSchema: StravaSyncOutputSchema,
  },
  async () => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/e70734fa-c464-4ea5-828b-d1b68da30a41';

    try {
      const response = await fetch(webhookUrl, { method: 'POST' });

      if (response.ok) {
        let activities: StravaActivity[] = await response.json();
        
        // O webhook pode retornar um array dentro de outro array, ou um objeto único
        if (Array.isArray(activities) && activities.length > 0 && Array.isArray(activities[0])) {
            activities = activities[0]; 
        } else if (!Array.isArray(activities)) {
            activities = [activities as any];
        }

        // Garante que o retorno seja sempre um array, mesmo que vazio.
        return activities || [];

      } else {
        const errorBody = await response.text();
        console.error(`Falha ao acionar o webhook. Status: ${response.status}. Detalhes: ${errorBody}`);
        throw new Error(`Falha na sincronização com o Strava. Status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Erro ao chamar e processar dados do Strava:', error);
       throw new Error('Ocorreu um erro ao processar os dados do Strava.');
    }
  }
);
