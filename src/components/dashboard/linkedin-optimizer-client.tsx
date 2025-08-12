'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { optimizeLinkedInProfile, OptimizeLinkedInProfileOutput } from '@/ai/flows/optimize-linkedin-profile';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Linkedin, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScoreGauge } from './score-gauge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { readAndEncodeFile } from '@/lib/utils';

const formSchema = z.object({
  profile: z.any().refine((file) => file?.length == 1, 'LinkedIn profile PDF is required.'),
});

type FormValues = z.infer<typeof formSchema>;

async function callOptimizeLinkedInProfile(
  profileDataUri: string,
  uid: string
): Promise<OptimizeLinkedInProfileOutput> {
  'use server';
  try {
    const result = await optimizeLinkedInProfile({ profileDataUri });
    
    await addDoc(collection(db, 'users', uid, 'analysisHistory'), {
      type: 'linkedin',
      output: result,
      createdAt: serverTimestamp(),
    });

    return result;
  } catch (error) {
    console.error('Error optimizing LinkedIn profile:', error);
    throw new Error('Failed to optimize LinkedIn profile. Please try again.');
  }
}

export function LinkedInOptimizerClient() {
  const [analysisResult, setAnalysisResult] = useState<OptimizeLinkedInProfileOutput | null>(null);
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

    try {
      const file = values.profile[0];
      const profileDataUri = await readAndEncodeFile(file);
      const result = await callOptimizeLinkedInProfile(profileDataUri, user.uid);
      setAnalysisResult(result);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Optimizer</CardTitle>
          <CardDescription>Upload a PDF of your LinkedIn profile to receive AI-driven optimization tips.</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <AccordionTrigger>Skills Feedback</AccordionTrigger>
                  <AccordionContent>{analysisResult.skillsFeedback}</AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Keyword Suggestions</AlertTitle>
                <AlertDescription>{analysisResult.keywordSuggestions}</AlertDescription>
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
  );
}
