
'use server';
/**
 * @fileOverview A flow to generate recipes by calling an external n8n webhook.
 *
 * - chefVirtualFlow - The main flow function.
 * - Recipe - The type for a recipe object.
 * - ChefFlowOutput - The union type for the flow's output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for the recipe object
const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  prepTime: z.string(),
  cookTime: z.string(),
  servings: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  nutrition: z.object({
    calories: z.string(),
    protein: z.string(),
    carbs: z.string(),
    fat: z.string(),
  }),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export { RecipeSchema };


const FlowInputSchema = z.object({
  prompt: z.string(),
  userId: z.string(),
});

type FlowInput = z.infer<typeof FlowInputSchema>;

// The output will now always be a text string containing the raw webhook response
const ChefFlowOutputSchema = z.object({
    text: z.string(),
});

export type ChefFlowOutput = z.infer<typeof ChefFlowOutputSchema>;


// Exported function to be called from the client
export async function chefVirtualFlow(input: FlowInput): Promise<ChefFlowOutput> {
  return await flow(input);
}

// The Genkit flow definition
const flow = ai.defineFlow(
  {
    name: 'chefVirtualFlow',
    inputSchema: FlowInputSchema,
    outputSchema: ChefFlowOutputSchema,
  },
  async ({ prompt, userId }) => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook/d6381d21-a089-498f-8248-6d7802c0a1a5';
    
    const payload = {
      sessionId: userId,
      body: {
        prompt: prompt,
        action: 'chef'
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Return the error response text directly
        const errorText = await response.text();
        return { text: errorText || `Webhook returned an error: ${response.statusText}` };
      }
      
      const responseText = await response.text();
      return { text: responseText };

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      return { text: `Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.` };
    }
  }
);
