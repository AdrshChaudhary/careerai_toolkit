'use server';

/**
 * @fileOverview An AI agent for optimizing LinkedIn profiles.
 *
 * - optimizeLinkedInProfile - A function that handles the LinkedIn profile optimization process.
 * - OptimizeLinkedInProfileInput - The input type for the optimizeLinkedInProfile function.
 * - OptimizeLinkedInProfileOutput - The return type for the optimizeLinkedInProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeLinkedInProfileInputSchema = z.object({
  profileDataUri: z
    .string()
    .describe(
      "A LinkedIn profile, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type OptimizeLinkedInProfileInput = z.infer<typeof OptimizeLinkedInProfileInputSchema>;

const OptimizeLinkedInProfileOutputSchema = z.object({
  profileStrengthScore: z.number().describe('An overall score indicating the strength of the LinkedIn profile.'),
  headlineFeedback: z.string().describe('Feedback on the profile headline.'),
  summaryFeedback: z.string().describe('Feedback on the profile summary.'),
  experienceFeedback: z.string().describe('Feedback on the experience section.'),
  skillsFeedback: z.string().describe('Feedback on the skills section.'),
  keywordSuggestions: z.string().describe('Keyword suggestions to improve profile visibility.'),
});
export type OptimizeLinkedInProfileOutput = z.infer<typeof OptimizeLinkedInProfileOutputSchema>;

export async function optimizeLinkedInProfile(input: OptimizeLinkedInProfileInput): Promise<OptimizeLinkedInProfileOutput> {
  return optimizeLinkedInProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeLinkedInProfilePrompt',
  input: {schema: OptimizeLinkedInProfileInputSchema},
  output: {schema: OptimizeLinkedInProfileOutputSchema},
  prompt: `You are a career expert specializing in LinkedIn profile optimization. Analyze the provided LinkedIn profile and provide feedback to improve its visibility and effectiveness.

Use the following LinkedIn profile data:

{{media url=profileDataUri}}

Specifically, provide:

- An overall profile strength score.
- Feedback on the headline, summary, experience, and skills sections.
- Keyword suggestions to improve visibility.

Ensure the feedback is actionable and specific to the provided profile.
`,
});

const optimizeLinkedInProfileFlow = ai.defineFlow(
  {
    name: 'optimizeLinkedInProfileFlow',
    inputSchema: OptimizeLinkedInProfileInputSchema,
    outputSchema: OptimizeLinkedInProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
