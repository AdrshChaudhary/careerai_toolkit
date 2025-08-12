'use server';

/**
 * @fileOverview An AI agent that analyzes a GitHub profile.
 * 
 * - analyzeGithubProfile - A function that handles the GitHub profile analysis process.
 * - AnalyzeGithubProfileInput - The input type for the analyzeGithubProfile function.
 * - AnalyzeGithubProfileOutput - The return type for the analyzeGithubProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGithubProfileInputSchema = z.object({
  githubUsername: z
    .string()
    .describe('The GitHub username to analyze.'),
});
export type AnalyzeGithubProfileInput = z.infer<typeof AnalyzeGithubProfileInputSchema>;

const AnalyzeGithubProfileOutputSchema = z.object({
  techStack: z.string().describe('A summary of the user\'s tech stack.'),
  codeQualityInsights: z.string().describe('Insights on the user\'s code quality.'),
  suggestions: z.string().describe('Suggestions for improvement.'),
  languageDistributionChart: z.string().optional().describe('Chart data for language distribution (e.g., as a data URI).'),
  repositoryCreationActivityChart: z.string().optional().describe('Chart data for repository creation activity (e.g., as a data URI).'),
});
export type AnalyzeGithubProfileOutput = z.infer<typeof AnalyzeGithubProfileOutputSchema>;

export async function analyzeGithubProfile(input: AnalyzeGithubProfileInput): Promise<AnalyzeGithubProfileOutput> {
  return analyzeGithubProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeGithubProfilePrompt',
  input: {schema: AnalyzeGithubProfileInputSchema},
  output: {schema: AnalyzeGithubProfileOutputSchema},
  prompt: `You are an AI expert in analyzing GitHub profiles.

You will analyze the GitHub profile of user {{{githubUsername}}} and their public repositories to provide insights on their tech stack, code quality, and suggestions for improvement.

Specifically, you will:
- Determine their primary tech stack based on the languages used in their repositories.
- Assess their code quality based on factors like code structure, documentation, and commit history.
- Provide actionable suggestions for improvement, focusing on areas where they can enhance their skills and contributions.

Present the results in a clear and concise manner.

Include general recommendations, but do not include any URLs.

Also generate chart data (using mermaid syntax) to present language distribution and repo creation activity.
`,
});

const analyzeGithubProfileFlow = ai.defineFlow(
  {
    name: 'analyzeGithubProfileFlow',
    inputSchema: AnalyzeGithubProfileInputSchema,
    outputSchema: AnalyzeGithubProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
