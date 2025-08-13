'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Linkedin, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScoreGauge } from './score-gauge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const formSchema = z.object({
  profile: z.any().refine((files) => files?.length == 1, 'LinkedIn profile PDF is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function LinkedInOptimizerClient() {
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    // This part will be implemented with Genkit later.
    setTimeout(() => {
        setAnalysisResult({
            profileStrengthScore: 88,
            headlineFeedback: "Your headline is strong and clearly states your current role. To make it more impactful, consider adding a key achievement or a specific area of expertise. For example: 'Senior Software Engineer at TechCorp | Building Scalable FinTech Solutions'.",
            summaryFeedback: "Your 'About' section provides a good overview of your experience. To enhance it, try to tell a more compelling story. Start with a powerful opening statement, and weave in your key skills and accomplishments naturally. Using first-person narrative ('I am passionate about...') can make it more engaging.",
            experienceFeedback: "You've listed your responsibilities well. To take it to the next level, reframe your bullet points to focus on your achievements using the STAR method (Situation, Task, Action, Result). For example, instead of 'Developed new features,' try 'Led the development of a new feature (Action) that increased user engagement by 20% (Result).'",
            skillsFeedback: "You have a comprehensive list of skills. Ensure your top 5 skills are the most relevant ones for the roles you are targeting. Actively seek endorsements from your connections for your most important skills to add credibility.",
            activityFeedback: "Your activity on LinkedIn is a bit low. Try to engage more by sharing relevant articles, commenting on posts from industry leaders, and posting updates about your own projects or learnings. A consistent presence can significantly boost your visibility.",
            keywordSuggestions: "Cloud Computing, SaaS, Microservices, Agile Methodologies, FinTech, API Design",
            overallSuggestions: "Your profile is solid, but with a few tweaks, it can be outstanding. Focus on quantifying your achievements in the experience section and increasing your engagement on the platform. Tailoring your headline and summary will also help you attract the right opportunities.",
        });
        setIsLoading(false);
    }, 2000);
  }

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Optimizer</CardTitle>
            <CardDescription>Upload a PDF of your LinkedIn profile to receive AI-driven optimization tips.</CardDescription>
          </CardHeader>
          <CardContent>
             <Alert className="mb-6">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>How to Download Your LinkedIn Profile</AlertTitle>
                <AlertDescription>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                        <li>Go to your LinkedIn profile page.</li>
                        <li>Click the <strong>More</strong> button in your introduction card.</li>
                        <li>Select <strong>Save to PDF</strong> from the dropdown menu.</li>
                    </ol>
                </AlertDescription>
            </Alert>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="profile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile PDF</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Optimize Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
            <CardDescription>Your profile feedback will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Optimizing your profile... This may take a moment.</p>
              </div>
            )}
            {analysisResult ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <ScoreGauge score={analysisResult.profileStrengthScore} />
                </div>
                <Accordion type="single" collapsible defaultValue="headline" className="w-full">
                  <AccordionItem value="headline">
                    <AccordionTrigger>Headline Feedback</AccordionTrigger>
                    <AccordionContent>{analysisResult.headlineFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="summary">
                    <AccordionTrigger>Summary Feedback</AccordionTrigger>
                    <AccordionContent>{analysisResult.summaryFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="experience">
                    <AccordionTrigger>Experience Feedback</AccordionTrigger>
                    <AccordionContent>{analysisResult.experienceFeedback}</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="skills">
                    <AccordionTrigger>Skills & Endorsements</AccordionTrigger>
                    <AccordionContent>{analysisResult.skillsFeedback}</AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="activity">
                    <AccordionTrigger>Activity & Engagement</AccordionTrigger>
                    <AccordionContent>{analysisResult.activityFeedback}</AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Keyword Suggestions</AlertTitle>
                  <AlertDescription>{analysisResult.keywordSuggestions}</AlertDescription>
                </Alert>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Overall Suggestions</AlertTitle>
                  <AlertDescription>{analysisResult.overallSuggestions}</AlertDescription>
                </Alert>
              </div>
            ) : !isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
                <Linkedin className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your results will be shown here after optimization.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
