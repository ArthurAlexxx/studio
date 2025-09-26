
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

const FlowInputSchema = z.object({
  prompt: z.string(),
  userId: z.string(),
});

type FlowInput = z.infer<typeof FlowInputSchema>;

// The output can be either a recipe object or a string message
const ChefFlowOutputSchema = z.union([
    RecipeSchema,
    z.string()
]);

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
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/d6381d21-a089-498f-8248-6d7802c0a1a5';
    
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
        throw new Error(`Webhook returned an error: ${response.statusText}`);
      }
      
      const responseData = await response.json();

      // Check if the response is an array and has content
      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0];

        // Check for the explicit error format
        if (firstItem.erro && typeof firstItem.erro === 'string') {
          return firstItem.erro;
        }

        // Check for a simple text output for chat continuation
        if (firstItem.output && typeof firstItem.output === 'string') {
            return firstItem.output;
        }
        
        // Check for the recipe format
        const parsedRecipe = RecipeSchema.safeParse(firstItem);
        if (parsedRecipe.success) {
          return parsedRecipe.data;
        }
      }
      
      // Fallback for unexpected formats
      return "Desculpe, a resposta do serviço não pôde ser processada. Por favor, tente novamente.";

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      return `Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.`;
    }
  }
);
