'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const LinkedInAnalysisInputSchema = z.object({
  profilePdfDataUri: z.string().describe("A PDF of the user's LinkedIn profile, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type LinkedInAnalysisInput = z.infer<typeof LinkedInAnalysisInputSchema>;

export const LinkedInAnalysisOutputSchema = z.object({
    profileStrengthScore: z.number().min(0).max(100).describe("A score from 0-100 representing the overall strength of the LinkedIn profile."),
    headlineFeedback: z.string().describe("Specific feedback on the profile headline with suggestions for improvement."),
    summaryFeedback: z.string().describe("Constructive feedback on the 'About' summary section."),
    experienceFeedback: z.string().describe("Feedback on how well the work experience is presented, with suggestions for improvement using methods like STAR."),
    skillsFeedback: z.string().describe("Feedback on the skills section, including relevance and endorsements."),
    activityFeedback: z.string().describe("Comments on the user's activity and engagement on the platform."),
    keywordSuggestions: z.string().describe("A comma-separated list of relevant keywords to add to the profile to improve search visibility."),
    overallSuggestions: z.string().describe("A summary of the most important suggestions for improving the profile."),
});
export type LinkedInAnalysisOutput = z.infer<typeof LinkedInAnalysisOutputSchema>;


export async function analyzeLinkedInProfile(input: LinkedInAnalysisInput): Promise<LinkedInAnalysisOutput> {
    return await linkedInAnalysisFlow(input);
}


const prompt = ai.definePrompt({
    name: 'linkedinAnalysisPrompt',
    input: { schema: LinkedInAnalysisInputSchema },
    output: { schema: LinkedInAnalysisOutputSchema },
    prompt: `You are an expert career coach and LinkedIn profile optimizer. Analyze the provided LinkedIn profile PDF and provide a detailed analysis.

    LinkedIn Profile:
    {{media url=profilePdfDataUri}}
    
    Your analysis should include the following:
    
    1.  **Profile Strength Score**: Assign a score from 0 to 100 that reflects the overall quality and completeness of the profile.
    2.  **Headline Feedback**: Critique the headline. Is it compelling? Does it clearly state their value proposition? Suggest improvements.
    3.  **Summary Feedback**: Evaluate the "About" section. Is it engaging? Does it tell a professional story? Suggest ways to make it more impactful.
    4.  **Experience Feedback**: Review the work experience descriptions. Are they focused on accomplishments rather than just responsibilities? Recommend using the STAR (Situation, Task, Action, Result) method and quantifying achievements.
    5.  **Skills & Endorsements**: Assess the skills list. Are the most important skills featured and endorsed?
    6.  **Activity & Engagement**: Comment on their recent activity. Are they active enough? Suggest a content and engagement strategy.
    7.  **Keyword Suggestions**: Provide a list of relevant keywords they should incorporate into their profile to appear in more recruiter searches for their target roles.
    8.  **Overall Suggestions**: Summarize the most critical advice to help the user improve their LinkedIn presence and attract more opportunities.
    
    Provide a comprehensive and constructive analysis to help the user stand out.`,
});

const linkedInAnalysisFlow = ai.defineFlow(
    {
        name: 'linkedInAnalysisFlow',
        inputSchema: LinkedInAnalysisInputSchema,
        outputSchema: LinkedInAnalysisOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
