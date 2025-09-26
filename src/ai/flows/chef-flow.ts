
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

// The output will now always be a text string
const ChefFlowOutputSchema = z.object({
    text: z.string().optional(),
});


export type ChefFlowOutput = z.infer<typeof ChefFlowOutputSchema>;

// Helper function to format the recipe object into a string
function formatRecipeToString(recipe: Recipe): string {
    const ingredients = recipe.ingredients.map(item => `- ${item}`).join('\n');
    const instructions = recipe.instructions.map(item => `${item}`).join('\n');

    return `🍽️ ${recipe.title}\n\n` +
           `${recipe.description}\n\n` +
           `⏱️ Tempo de preparo: ${recipe.prepTime}\n` +
           `🔥 Tempo de cozimento: ${recipe.cookTime}\n` +
           `👥 Porções: ${recipe.servings}\n\n` +
           `📝 Ingredientes:\n${ingredients}\n\n` +
           `👨‍🍳 Modo de Preparo:\n${instructions}\n\n` +
           `🔎 Informação Nutricional:\n` +
           `- Calorias: ${recipe.nutrition.calories}\n` +
           `- Proteínas: ${recipe.nutrition.protein}\n` +
           `- Carboidratos: ${recipe.nutrition.carbs}\n` +
           `- Gorduras: ${recipe.nutrition.fat}`;
}


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

      // First, check for a mixed response (text + JSON)
      const jsonStartIndex = responseText.indexOf('{');
      if (jsonStartIndex > 0) {
        const textPart = responseText.substring(0, jsonStartIndex).trim();
        const jsonPart = responseText.substring(jsonStartIndex);
        
        try {
          const parsedJson = JSON.parse(jsonPart);
          const parsedRecipe = RecipeSchema.safeParse(parsedJson);

          if (parsedRecipe.success) {
            const formattedRecipe = formatRecipeToString(parsedRecipe.data);
            return { text: `${textPart}\n\n${formattedRecipe}` };
          }
        } catch (e) {
            // If JSON parsing fails, just return the text part
            return { text: textPart };
        }
      }

      // If not a mixed response, try parsing as a pure JSON response (array)
      try {
          const data = JSON.parse(responseText);

          if (Array.isArray(data) && data.length > 0) {
              const firstItem = data[0];
              
              // Case 1: It's a recipe
              const parsedRecipe = RecipeSchema.safeParse(firstItem);
              if (parsedRecipe.success) {
                  return { text: formatRecipeToString(parsedRecipe.data) };
              }
              // Case 2: It's an error message
              if (firstItem.erro) {
                  return { text: firstItem.erro };
              }
              // Case 3: It's a conversational output
              if (firstItem.output) {
                  return { text: firstItem.output };
              }
          }
      } catch (e) {
         // Not a valid JSON, so treat as plain text.
         return { text: responseText };
      }

      // Fallback for any other case (e.g., pure text that wasn't caught before)
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
