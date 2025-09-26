
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

      // Case 1: Response contains both text and a JSON object for the recipe
      const jsonStartIndex = responseText.indexOf('{');
      if (responseText.startsWith('[') || jsonStartIndex === -1) {
          // This is likely a pure JSON response (array or object) or pure text
          try {
              const data = JSON.parse(responseText);

              if (Array.isArray(data) && data.length > 0) {
                  const firstItem = data[0];
                  
                  const parsedRecipe = RecipeSchema.safeParse(firstItem);
                  if (parsedRecipe.success) {
                      return { recipe: parsedRecipe.data };
                  }
                  if (firstItem.erro) {
                      return { text: firstItem.erro };
                  }
                  if (firstItem.output) {
                      return { text: firstItem.output };
                  }
              }
          } catch (e) {
             // Not a valid JSON, so treat as plain text.
             return { text: responseText };
          }
      } else if (jsonStartIndex > 0) {
        // This is a mixed response with text and a JSON object
        const textPart = responseText.substring(0, jsonStartIndex).trim();
        const jsonPart = responseText.substring(jsonStartIndex);
        
        try {
          const parsedJson = JSON.parse(jsonPart);
          const parsedRecipe = RecipeSchema.safeParse(parsedJson);

          if (parsedRecipe.success) {
            return { text: textPart, recipe: parsedRecipe.data };
          }
        } catch (e) {
          // Fallback to returning just the text part if JSON is invalid
          return { text: textPart };
        }
      }

      // Fallback for any other case: return the plain text
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
