
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

export type Recipe = z.infer<typeof RecipeSchema>;

const FlowInputSchema = z.object({
  prompt: z.string(),
  userId: z.string(),
});

type FlowInput = z.infer<typeof FlowInputSchema>;

// Exported function to be called from the client
export async function chefVirtualFlow(input: FlowInput): Promise<Recipe | string> {
  return await flow(input);
}

// The Genkit flow definition
const flow = ai.defineFlow(
  {
    name: 'chefVirtualFlow',
    inputSchema: FlowInputSchema,
    outputSchema: z.union([RecipeSchema, z.string()]),
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
        const errorText = await response.text();
        console.error("Webhook call failed:", errorText);
        throw new Error(`Webhook returned an error: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      if (!responseText) {
          // Handle empty response body
          return "Recebi sua mensagem, mas não tenho uma resposta no momento.";
      }

      const responseData = JSON.parse(responseText);
      
      // Handle array vs. object responses
      let potentialRecipe = Array.isArray(responseData) && responseData.length > 0
        ? responseData[0]
        : responseData;

      // Handle text output from chat
      if (typeof potentialRecipe.output === 'string') {
        // If there's an `output` field with a string, it's likely a chat message
        return potentialRecipe.output;
      }
      
      const parsedRecipe = RecipeSchema.safeParse(potentialRecipe);
      if (parsedRecipe.success) {
        return parsedRecipe.data;
      }
      
      throw new Error("The webhook response was not in a recognized format (Recipe or chat output).");

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", error.errors);
      }
      throw new Error(`Failed to process response from webhook: ${error.message}`);
    }
  }
);
