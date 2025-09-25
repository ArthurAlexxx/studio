
'use server';
/**
 * @fileOverview A flow to generate recipes by calling an external n8n webhook.
 *
 * - chefVirtualFlow - The main flow function.
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

// Input schema for the flow
const ChefVirtualFlowInputSchema = z.object({
  ingredients: z.string(),
  mealType: z.string(),
  preferences: z.string().optional(),
  optimize: z.boolean(),
});

type ChefVirtualFlowInput = z.infer<typeof ChefVirtualFlowInputSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

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
      
      // Validate the direct JSON response against the schema
      const recipe = RecipeSchema.parse(responseData);
      return recipe;

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", error.errors);
          throw new Error("The webhook response was not in the expected format.");
      }
      throw new Error(`Failed to process recipe from webhook: ${error.message}`);
    }
  }
);
