
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
      const jsonStart = responseText.indexOf('{');
      const textPart = jsonStart > 0 ? responseText.substring(0, jsonStart).trim() : '';
      const jsonPart = jsonStart !== -1 ? responseText.substring(jsonStart) : '';
      
      if (jsonPart) {
         try {
            const parsedJson = JSON.parse(jsonPart);
            
            // Handle array format, e.g. from n8n
            const data = Array.isArray(parsedJson) ? parsedJson[0] : parsedJson;

            // Check for recipe
            const parsedRecipe = RecipeSchema.safeParse(data);
            if (parsedRecipe.success) {
                return {
                    text: textPart,
                    recipe: parsedRecipe.data,
                };
            }
         } catch (e) {
             // JSON parsing failed, but we might have text content
             if (textPart) {
                return { text: textPart };
             }
             console.error("Failed to parse JSON part of the response", e);
             return { text: "Desculpe, a resposta do serviço está em um formato inválido." };
         }
      }

      // If no JSON part, or parsing failed, return the text part
      // This also handles `erro` and `output` cases if they are not inside a larger JSON
      if (responseText) {
          try {
              const data = JSON.parse(responseText);
              const responseData = Array.isArray(data) ? data[0] : data;
              if (responseData.erro && typeof responseData.erro === 'string') {
                return { text: responseData.erro };
              }
              if (responseData.output && typeof responseData.output === 'string') {
                return { text: responseData.output };
              }
          } catch(e) {
             // It's just plain text.
             return { text: responseText };
          }
      }

      return { text: "Desculpe, a resposta do serviço não pôde ser processada." };

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      return { text: `Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.` };
    }
  }
);
