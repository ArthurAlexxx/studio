
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

// The output can be either a recipe object, a string message, or a combination
const ChefFlowOutputSchema = z.object({
    text: z.string().optional(),
    recipe: RecipeSchema.optional(),
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
        throw new Error(`Webhook returned an error: ${response.statusText}`);
      }
      
      const responseText = await response.text();

      // Find the start of the JSON object
      const jsonStartIndex = responseText.indexOf('{');
      const jsonStartBracketIndex = responseText.indexOf('[');
      
      let jsonStart = -1;

      if (jsonStartIndex !== -1 && jsonStartBracketIndex !== -1) {
          jsonStart = Math.min(jsonStartIndex, jsonStartBracketIndex);
      } else if (jsonStartIndex !== -1) {
          jsonStart = jsonStartIndex;
      } else {
          jsonStart = jsonStartBracketIndex;
      }

      const textPart = jsonStart > 0 ? responseText.substring(0, jsonStart).trim() : '';
      const jsonPart = jsonStart !== -1 ? responseText.substring(jsonStart) : '';
      
      if (jsonPart) {
         try {
            let data = JSON.parse(jsonPart);
            
            // Handle array format, e.g., from n8n which returns [ { ... } ]
            const recipeData = Array.isArray(data) ? data[0] : data;

            // 1. Check for a valid recipe
            const parsedRecipe = RecipeSchema.safeParse(recipeData);
            if (parsedRecipe.success) {
                return {
                    text: textPart, // Return any introductory text
                    recipe: parsedRecipe.data,
                };
            }
            
            // 2. Check for an error message
            if (recipeData.erro && typeof recipeData.erro === 'string') {
              return { text: recipeData.erro };
            }

            // 3. Check for a chat output message
            if (recipeData.output && typeof recipeData.output === 'string') {
              return { text: recipeData.output };
            }

         } catch (e) {
             // JSON parsing failed, but we might have a valid text part.
             if (textPart) {
                return { text: textPart };
             }
             // If no text part and JSON fails, return the original raw text.
             return { text: responseText };
         }
      }

      // If we are here, it means we likely only have a text response.
      if (responseText) {
          return { text: responseText };
      }

      return { text: "Desculpe, a resposta do serviço não pôde ser processada." };

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      return { text: `Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.` };
    }
  }
);
