
'use server';
/**
 * @fileOverview A flow to generate recipes by calling an external n8n webhook.
 *
 * - chefVirtualFlow - The main flow function.
 * - ChefVirtualFlowInputSchema - The Zod schema for the flow's input.
 * - RecipeSchema - The Zod schema for the recipe structure returned by the webhook.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for the recipe object
export const RecipeSchema = z.object({
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

// Input schema for the flow
export const ChefVirtualFlowInputSchema = z.object({
  ingredients: z.string(),
  mealType: z.string(),
  preferences: z.string().optional(),
  optimize: z.boolean(),
});

type ChefVirtualFlowInput = z.infer<typeof ChefVirtualFlowInputSchema>;
type Recipe = z.infer<typeof RecipeSchema>;

// Exported function to be called from the client
export async function chefVirtualFlow(input: ChefVirtualFlowInput): Promise<Recipe> {
  return await flow(input);
}

// The Genkit flow definition
const flow = ai.defineFlow(
  {
    name: 'chefVirtualFlow',
    inputSchema: ChefVirtualFlowInputSchema,
    outputSchema: RecipeSchema,
  },
  async (input) => {
    const webhookUrl = 'https://arthuralex.app.n8n.cloud/webhook-test/d6381d21-a089-498f-8248-6d7802c0a1a5';
    
    const payload = {
      action: 'chef',
      ...input
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Webhook call failed:", errorText);
        throw new Error(`Webhook returned an error: ${response.statusText}`);
      }
      
      const responseData = await response.json();

      if (responseData && responseData.length > 0 && typeof responseData[0].output === 'string' && responseData[0].output.trim() !== '') {
        let recipeString = responseData[0].output;

        if (recipeString.startsWith('```json')) {
          recipeString = recipeString.substring(7, recipeString.length - 3).trim();
        }

        const recipeJson = JSON.parse(recipeString);
        return RecipeSchema.parse(recipeJson); // Validate the response against the schema
      } else {
        throw new Error("The webhook response was not in the expected format.");
      }

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      throw new Error(`Failed to process recipe from webhook: ${error.message}`);
    }
  }
);
