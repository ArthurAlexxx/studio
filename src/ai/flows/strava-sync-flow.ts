'use server';
/**
 * @fileOverview Um fluxo para sincronizar atividades do Strava.
 *
 * - stravaSync - Uma função que aciona um webhook para iniciar a sincronização.
 * - StravaSyncOutput - O tipo de retorno para a função stravaSync.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';

export const StravaSyncOutputSchema = z.object({
  success: z.boolean().describe('Indica se a chamada ao webhook foi bem-sucedida.'),
  message: z.string().optional().describe('Uma mensagem descrevendo o resultado.'),
});

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
        return { success: true, message: 'Webhook acionado com sucesso.' };
      } else {
        const errorBody = await response.text();
        return { success: false, message: `Falha ao acionar o webhook. Status: ${response.status}. Detalhes: ${errorBody}` };
      }
    } catch (error: any) {
      console.error('Erro ao chamar o webhook do Strava:', error);
      return { success: false, message: error.message || 'Ocorreu um erro de rede ao tentar sincronizar.' };
    }
  }
);
