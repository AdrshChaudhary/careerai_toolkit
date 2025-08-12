'use server';

/**
 * @fileOverview This file implements the Genkit flow for analyzing a GitHub repository.
 *
 * - analyzeGithubRepository - Analyzes a GitHub repository's README and metadata to provide feedback.
 * - AnalyzeGithubRepositoryInput - The input type for the analyzeGithubRepository function.
 * - AnalyzeGithubRepositoryOutput - The return type for the analyzeGithubRepository function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGithubRepositoryInputSchema = z.object({
  repositoryUrl: z.string().describe('The URL of the public GitHub repository.'),
});
export type AnalyzeGithubRepositoryInput = z.infer<typeof AnalyzeGithubRepositoryInputSchema>;

const AnalyzeGithubRepositoryOutputSchema = z.object({
  purposeFeedback: z.string().describe('Feedback on the repository\'s stated purpose.'),
  documentationQualityFeedback: z.string().describe('Feedback on the quality of the repository documentation.'),
  suggestions: z.string().describe('Suggestions for improving the repository.'),
});
export type AnalyzeGithubRepositoryOutput = z.infer<typeof AnalyzeGithubRepositoryOutputSchema>;

export async function analyzeGithubRepository(input: AnalyzeGithubRepositoryInput): Promise<AnalyzeGithubRepositoryOutput> {
  return analyzeGithubRepositoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeGithubRepositoryPrompt',
  input: {schema: AnalyzeGithubRepositoryInputSchema},
  output: {schema: AnalyzeGithubRepositoryOutputSchema},
  prompt: `You are an expert in software development and open-source repositories.\n
  Analyze the provided GitHub repository based on its README and metadata. Provide feedback on the repository\'s stated purpose, the quality of its documentation, and offer concrete suggestions for improvement.\n
  Repository URL: {{{repositoryUrl}}}\n\n  Purpose Feedback: \n  Documentation Quality Feedback:\n  Suggestions:\n  `,
});

const analyzeGithubRepositoryFlow = ai.defineFlow(
  {
    name: 'analyzeGithubRepositoryFlow',
    inputSchema: AnalyzeGithubRepositoryInputSchema,
    outputSchema: AnalyzeGithubRepositoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
