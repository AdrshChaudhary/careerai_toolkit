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
  jobDescription: z.string().optional().describe('The job description to compare the resume against.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  atsScore: z.number().describe('An overall ATS score for the resume (0-100). Only generate if a job description is provided, otherwise return 0.'),
  summaryFeedback: z.string().describe('Feedback on the resume summary section.'),
  skillsFeedback: z.string().describe('Feedback on the resume skills section.'),
  experienceFeedback: z.string().describe('Feedback on the resume experience section.'),
  educationFeedback: z.string().describe('Feedback on the resume education section.'),
  jobRoleSuggestions: z.string().describe('Suggestions for suitable job roles based on the resume.'),
  comprehensiveAnalysis: z.string().describe('A comprehensive analysis of the resume, summarizing its strengths and weaknesses and providing actionable advice for improvement.'),
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

You will analyze the provided resume text.

{{#if jobDescription}}
You will compare it against the provided job description. Provide feedback on the resume's summary, skills, experience, and education sections, and provide an overall ATS score (0-100).
{{else}}
You will provide a comprehensive analysis without a job description. Provide feedback on the resume's summary, skills, experience, and education sections. Do not generate an ATS score.
{{/if}}

In addition, provide a comprehensive analysis that summarizes the resume's strengths and weaknesses, and gives actionable advice for improvement.

Suggest suitable job roles based on the resume's content.

Resume Text: {{{resumeText}}}
{{#if jobDescription}}
Job Description: {{{jobDescription}}}
{{/if}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get analysis from AI.");
    }
    if (!input.jobDescription) {
        output.atsScore = 0;
    }
    return output;
  }
);
