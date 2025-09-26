
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

type Recipe = z.infer<typeof RecipeSchema>;

const FlowInputSchema = z.object({
  prompt: z.string(),
  userId: z.string(),
});

type FlowInput = z.infer<typeof FlowInputSchema>;

// Helper function to format the recipe object into a readable string
function formatRecipeToString(recipe: Recipe): string {
    const ingredients = recipe.ingredients.map(item => `- ${item}`).join('\n');
    const instructions = recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n');

    return `
*${recipe.title}*

${recipe.description}

*Tempo de Preparo:* ${recipe.prepTime}
*Tempo de Cozimento:* ${recipe.cookTime}
*Rendimento:* ${recipe.servings}

*Ingredientes:*
${ingredients}

*Modo de Preparo:*
${instructions}

*Informação Nutricional (por porção):*
- Calorias: ${recipe.nutrition.calories}
- Proteínas: ${recipe.nutrition.protein}
- Carboidratos: ${recipe.nutrition.carbs}
- Gorduras: ${recipe.nutrition.fat}
    `.trim();
}


// Exported function to be called from the client
export async function chefVirtualFlow(input: FlowInput): Promise<string> {
  return await flow(input);
}

// The Genkit flow definition
const flow = ai.defineFlow(
  {
    name: 'chefVirtualFlow',
    inputSchema: FlowInputSchema,
    outputSchema: z.string(),
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
      
      // Handle potential empty response
      const responseText = await response.text();
      if (!responseText) {
          return "Recebi sua mensagem, mas não tenho uma resposta no momento.";
      }
      const responseData = JSON.parse(responseText);

      // It can be an array with the recipe or a direct chat message object.
      let potentialRecipeData = Array.isArray(responseData) && responseData.length > 0
        ? responseData[0]
        : responseData;
      
      // If it's a chat message like { output: "Hello" }
      if (typeof potentialRecipeData.output === 'string') {
        return potentialRecipeData.output;
      }
      
      // Try to parse as a full recipe
      const parsedRecipe = RecipeSchema.safeParse(potentialRecipeData);

      if (parsedRecipe.success) {
        // Format the valid recipe into a string
        return formatRecipeToString(parsedRecipe.data);
      } else {
         // If it's not a recipe and not a chat, it might be a simple string response
         if(typeof potentialRecipeData === 'string'){
            return potentialRecipeData;
         }
        // If validation fails, it's an unexpected format
        console.error("Zod validation errors:", parsedRecipe.error.errors);
        throw new Error("A resposta do webhook não é uma receita ou uma mensagem de texto válida.");
      }

    } catch (error: any) {
      console.error('Error in chefVirtualFlow:', error);
      if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", error.errors);
      }
      throw new Error(`Failed to process response from webhook: ${error.message}`);
    }
  }
);
