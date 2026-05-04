'use server';
/**
 * @fileOverview Provides personalized workout suggestions based on user fitness goals.
 *
 * - getPersonalizedWorkoutSuggestions - A function that generates a personalized workout plan.
 * - PersonalizedWorkoutSuggestionsInput - The input type for the getPersonalizedWorkoutSuggestions function.
 * - PersonalizedWorkoutSuggestionsOutput - The return type for the getPersonalizedWorkoutSuggestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedWorkoutSuggestionsInputSchema = z.object({
  fitnessGoals: z
    .string()
    .describe(
      'The user\'s fitness goals, e.g., "strength", "cardio", "weight loss".'
    ),
});
export type PersonalizedWorkoutSuggestionsInput = z.infer<
  typeof PersonalizedWorkoutSuggestionsInputSchema
>;

const PersonalizedWorkoutSuggestionsOutputSchema = z.object({
  workoutPlanName: z
    .string()
    .describe('A catchy and descriptive name for the personalized workout plan.'),
  description: z
    .string()
    .describe('A brief overview and description of the workout plan.'),
  goalsAchieved: z
    .array(z.string())
    .describe('A list of fitness goals that this plan aims to achieve.'),
  workoutSuggestions: z
    .array(
      z.object({
        day: z
          .string()
          .describe(
            'The specific day or type of workout, e.g., "Day 1: Full Body", "Cardio Day".'
          ),
        exercises: z
          .array(
            z.object({
              name: z
                .string()
                .describe('The name of the exercise, e.g., "Squats", "Push-ups".'),
              sets: z.number().describe('The number of sets for the exercise.'),
              reps: z
                .string()
                .describe(
                  'The repetitions or duration for the exercise, e.g., "8-12 reps", "30 seconds".'
                ),
              notes: z
                .string()
                .describe(
                  'Any specific instructions or notes for the exercise, e.g., "Rest 60s", "Perform as a superset".'
                ),
            })
          )
          .describe('A list of exercises for this workout day/type.'),
      })
    )
    .describe(
      'A structured list of workout days/types with their respective exercises.'
    ),
  tips: z
    .array(z.string())
    .describe('General fitness tips or advice relevant to the personalized plan.'),
});
export type PersonalizedWorkoutSuggestionsOutput = z.infer<
  typeof PersonalizedWorkoutSuggestionsOutputSchema
>;

export async function getPersonalizedWorkoutSuggestions(
  input: PersonalizedWorkoutSuggestionsInput
): Promise<PersonalizedWorkoutSuggestionsOutput> {
  return personalizedWorkoutSuggestionsFlow(input);
}

const personalizedWorkoutSuggestionsPrompt = ai.definePrompt({
  name: 'personalizedWorkoutSuggestionsPrompt',
  input: { schema: PersonalizedWorkoutSuggestionsInputSchema },
  output: { schema: PersonalizedWorkoutSuggestionsOutputSchema },
  prompt: `You are an expert fitness trainer specializing in creating personalized workout plans.
Your goal is to provide a comprehensive workout suggestion based on the user's fitness goals.
The plan should be clear, actionable, and include a variety of exercises.

Based on the following fitness goals, create a personalized workout plan:

User's Fitness Goals: "{{{fitnessGoals}}}"

Structure your response strictly as a JSON object matching the provided schema.
Ensure the workout plan includes a catchy name, a description, clear daily routines with exercises (sets, reps, notes), and general fitness tips.
Make sure to provide at least 3-4 distinct workout days/types.
For each exercise, provide realistic sets and reps based on common fitness practices.`,
});

const personalizedWorkoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedWorkoutSuggestionsFlow',
    inputSchema: PersonalizedWorkoutSuggestionsInputSchema,
    outputSchema: PersonalizedWorkoutSuggestionsOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedWorkoutSuggestionsPrompt(input);
    return output!;
  }
);
