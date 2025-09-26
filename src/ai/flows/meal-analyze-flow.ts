
'use server';
/**
 * @fileOverview A flow to analyze a food item by calling an external n8n webhook.
 *
 * - analyzeFood - The main flow function.
 * - FoodAnalysisInput - The input type for the analyzeFood function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { type MealData } from '@/types/meal';

const FoodAnalysisInputSchema = z.object({
  alimento: z.string(),
  porcao: z.number(),
  unidade: z.string(),
});

export type FoodAnalysisInput = z.infer<typeof FoodAnalysisInputSchema>;

// The output will be the MealData or null
const FoodAnalysisOutputSchema = z.custom<MealData>().nullable();

// Exported function to be called from the client
export async function analyzeFood(input: FoodAnalysisInput): Promise<MealData | null> {
  return await mealAnalyzeFlow(input);
}

// The Genkit flow definition
const mealAnalyzeFlow = ai.defineFlow(
  {
    name: 'mealAnalyzeFlow',
    inputSchema: FoodAnalysisInputSchema,
    outputSchema: FoodAnalysisOutputSchema,
  },
  async (input) => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/d6381d21-a089-498f-8248-6d7802c0a1a5';
    
    const payload = {
        action: 'ref',
        alimento: input.alimento,
        porcao: input.porcao,
        unidade: input.unidade,
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Webhook returned an error: ${response.statusText}`);
        return null;
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // The webhook returns an array, so we take the first element
        return Array.isArray(data) ? data[0] : data;
      }

      return null;

    } catch (error: any) {
      console.error('Error in mealAnalyzeFlow:', error);
      return null;
    }
  }
);
