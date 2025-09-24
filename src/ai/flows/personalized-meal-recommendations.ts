// src/ai/flows/personalized-meal-recommendations.ts
'use server';

/**
 * @fileOverview Generates personalized meal recommendations based on user dietary preferences, health goals, and available ingredients.
 *
 * - personalizedMealRecommendations - A function that generates personalized meal recommendations.
 * - PersonalizedMealRecommendationsInput - The input type for the personalizedMealRecommendations function.
 * - PersonalizedMealRecommendationsOutput - The return type for the personalizedMealRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMealRecommendationsInputSchema = z.object({
  dietaryPreferences: z
    .string()
    .describe('The user dietary preferences, such as vegetarian, vegan, gluten-free, etc.'),
  healthGoals: z
    .string()
    .describe('The user health goals, such as weight loss, muscle gain, etc.'),
  availableIngredients: z
    .string()
    .describe('The ingredients that the user has available.'),
});
export type PersonalizedMealRecommendationsInput = z.infer<
  typeof PersonalizedMealRecommendationsInputSchema
>;

const PersonalizedMealRecommendationsOutputSchema = z.object({
  mealRecommendations: z
    .string()
    .describe('A list of personalized meal recommendations.'),
});
export type PersonalizedMealRecommendationsOutput = z.infer<
  typeof PersonalizedMealRecommendationsOutputSchema
>;

export async function personalizedMealRecommendations(
  input: PersonalizedMealRecommendationsInput
): Promise<PersonalizedMealRecommendationsOutput> {
  return personalizedMealRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedMealRecommendationsPrompt',
  input: {schema: PersonalizedMealRecommendationsInputSchema},
  output: {schema: PersonalizedMealRecommendationsOutputSchema},
  prompt: `You are a nutritionist expert. Generate personalized meal recommendations based on the user's dietary preferences, health goals, and available ingredients.

Dietary Preferences: {{{dietaryPreferences}}}
Health Goals: {{{healthGoals}}}
Available Ingredients: {{{availableIngredients}}}

Meal Recommendations:`,
});

const personalizedMealRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedMealRecommendationsFlow',
    inputSchema: PersonalizedMealRecommendationsInputSchema,
    outputSchema: PersonalizedMealRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
