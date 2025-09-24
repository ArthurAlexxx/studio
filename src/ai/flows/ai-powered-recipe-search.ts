'use server';
/**
 * @fileOverview AI-Powered Recipe Search Flow.
 *
 * This flow allows users to search for recipes based on their dietary preferences,
 * health goals, and available ingredients using AI.
 *
 * @interface AIPoweredRecipeSearchInput - Defines the input parameters for the recipe search.
 * @interface AIPoweredRecipeSearchOutput - Defines the output, providing a list of recipe suggestions.
 *
 * @function aiPoweredRecipeSearch - The main function to trigger the recipe search flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredRecipeSearchInputSchema = z.object({
  preferences: z
    .string()
    .describe('Dietary preferences and health goals of the user.'),
  ingredients: z
    .string()
    .describe('Available ingredients the user wants to include in the recipes.'),
  cuisine: z.string().optional().describe('Optional cuisine preferences.'),
});

export type AIPoweredRecipeSearchInput = z.infer<
  typeof AIPoweredRecipeSearchInputSchema
>;

const AIPoweredRecipeSearchOutputSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string().describe('The title of the recipe.'),
      ingredients: z.string().describe('A list of ingredients for the recipe.'),
      instructions: z.string().describe('Instructions for preparing the recipe.'),
      url: z.string().url().describe('URL of the recipe'),
      description: z.string().describe('A short description of the recipe'),
    })
  ).describe('A list of recipe suggestions based on the user input.'),
});

export type AIPoweredRecipeSearchOutput = z.infer<
  typeof AIPoweredRecipeSearchOutputSchema
>;

const recipeSearchPrompt = ai.definePrompt({
  name: 'recipeSearchPrompt',
  input: {schema: AIPoweredRecipeSearchInputSchema},
  output: {schema: AIPoweredRecipeSearchOutputSchema},
  prompt: `You are a recipe recommendation expert. Given the user's dietary preferences, available ingredients, and optional cuisine preferences, suggest a list of suitable and tasty recipes.

Dietary Preferences and Health Goals: {{{preferences}}}
Available Ingredients: {{{ingredients}}}
Cuisine Preferences: {{{cuisine}}}

Please provide a diverse range of recipes that the user can easily prepare. Each recipe should contain title, ingredients, instructions, URL and a short description.
`,
});

const aiPoweredRecipeSearchFlow = ai.defineFlow(
  {
    name: 'aiPoweredRecipeSearchFlow',
    inputSchema: AIPoweredRecipeSearchInputSchema,
    outputSchema: AIPoweredRecipeSearchOutputSchema,
  },
  async input => {
    const {output} = await recipeSearchPrompt(input);
    return output!;
  }
);

export async function aiPoweredRecipeSearch(
  input: AIPoweredRecipeSearchInput
): Promise<AIPoweredRecipeSearchOutput> {
  return aiPoweredRecipeSearchFlow(input);
}
