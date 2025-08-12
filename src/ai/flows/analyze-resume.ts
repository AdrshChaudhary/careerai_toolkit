'use server';
/**
 * @fileOverview A resume analysis AI agent.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z.string().describe('The job description to compare the resume against.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  atsScore: z.number().describe('An overall ATS score for the resume (0-100).'),
  summaryFeedback: z.string().describe('Feedback on the resume summary section.'),
  skillsFeedback: z.string().describe('Feedback on the resume skills section.'),
  experienceFeedback: z.string().describe('Feedback on the resume experience section.'),
  educationFeedback: z.string().describe('Feedback on the resume education section.'),
  jobRoleSuggestions: z.string().describe('Suggestions for suitable job roles based on the resume.'),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert career coach specializing in resume optimization and Applicant Tracking Systems (ATS).

You will analyze the provided resume text and compare it against the provided job description. Provide feedback on the resume's summary, skills, experience, and education sections, and provide an overall ATS score (0-100).

Suggest suitable job roles based on the resume's content.

Resume Text: {{{resumeText}}}
Job Description: {{{jobDescription}}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
