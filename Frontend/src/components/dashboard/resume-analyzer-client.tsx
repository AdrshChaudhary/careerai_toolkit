'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, Briefcase, Bot, Lightbulb } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScoreGauge } from './score-gauge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ★ NEW: Import ReactMarkdown
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

function formatMarkdownList(text: string) {
  if (!text) return '';
  // Add a newline before each numbered list item if not already present
  return text.replace(/(\d+\.\s+)/g, '\n$1');
}

const comprehensiveSchema = z.object({
  resume: z.any().refine((files) => files?.length == 1, 'Resume PDF is required.'),
});

const jobDescriptionSchema = z.object({
  resume: z.any().refine((files) => files?.length == 1, 'Resume PDF is required.'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
});

type ComprehensiveFormValues = z.infer<typeof comprehensiveSchema>;
type JobDescriptionFormValues = z.infer<typeof jobDescriptionSchema>;

export function ResumeAnalyzerClient() {
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comprehensive');
  const { toast } = useToast();
  const { user } = useAuth();

  const comprehensiveForm = useForm<ComprehensiveFormValues>({
    resolver: zodResolver(comprehensiveSchema),
  });

  const jobDescriptionForm = useForm<JobDescriptionFormValues>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: {
      jobDescription: '',
    },
  });

  async function handleSubmit(endpoint: string, formData: FormData) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in.' });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get analysis from the server.');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not get analysis. Please ensure the backend server is running and try again.',
      });
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function onComprehensiveSubmit(values: ComprehensiveFormValues) {
    const formData = new FormData();
    formData.append('resume', values.resume[0]);
    await handleSubmit('/resume-analyzer/comprehensive', formData);
  }

  async function onJobDescriptionSubmit(values: JobDescriptionFormValues) {
    const formData = new FormData();
    formData.append('resume', values.resume[0]);
    formData.append('jobDescription', values.jobDescription);
    await handleSubmit('/resume-analyzer/job-description', formData);
  }

  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <Tabs defaultValue="comprehensive" onValueChange={setActiveTab} className="w-full">
          <Card>
            <TabsList className="grid w-full grid-cols-2 mt-6 mx-auto max-w-[calc(100%-2rem)]">
              <TabsTrigger value="comprehensive">Comprehensive</TabsTrigger>
              <TabsTrigger value="jobDescription">Job Description</TabsTrigger>
            </TabsList>
            <TabsContent value="comprehensive" className="m-0">
              <CardHeader>
                <CardTitle>Comprehensive Analysis</CardTitle>
                <CardDescription>Get a general analysis of your resume's strengths and weaknesses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...comprehensiveForm}>
                  <form onSubmit={comprehensiveForm.handleSubmit(onComprehensiveSubmit)} className="space-y-6">
                    <FormField
                      control={comprehensiveForm.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume PDF</FormLabel>
                          <FormControl>
                            <Input type="file" accept="application/pdf" onChange={(e) => field.onChange(e.target.files)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Analyze Resume
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            <TabsContent value="jobDescription" className="m-0">
              <CardHeader>
                <CardTitle>Job Description Based</CardTitle>
                <CardDescription>Analyze your resume against a specific job description for an Overall score.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...jobDescriptionForm}>
                  <form onSubmit={jobDescriptionForm.handleSubmit(onJobDescriptionSubmit)} className="space-y-6">
                    <FormField
                      control={jobDescriptionForm.control}
                      name="resume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume PDF</FormLabel>
                          <FormControl>
                            <Input type="file" accept="application/pdf" onChange={(e) => field.onChange(e.target.files)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={jobDescriptionForm.control}
                      name="jobDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Paste the full job description here..." className="min-h-[200px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Analyze Resume
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Card>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Your resume feedback will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your resume... This may take a moment.</p>
              </div>
            )}
            {analysisResult ? (
              <div className="space-y-6">
                {analysisResult.score > 0 && (
                  <div className="flex justify-center">
                    <ScoreGauge score={analysisResult.score} />
                  </div>
                )}
                {analysisResult.comprehensiveAnalysis && (
                  <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle>Comprehensive Analysis</AlertTitle>
                    <AlertDescription><ReactMarkdown>{analysisResult.comprehensiveAnalysis}</ReactMarkdown></AlertDescription>
                  </Alert>
                )}
                <Accordion type="single" collapsible defaultValue="summary" className="w-full">
                  <AccordionItem value="summary">
                    <AccordionTrigger>Summary Feedback</AccordionTrigger>
                    <AccordionContent><ReactMarkdown>{analysisResult.summaryFeedback}</ReactMarkdown></AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="skills">
                    <AccordionTrigger>Skills Feedback</AccordionTrigger>
                    <AccordionContent><ReactMarkdown>{analysisResult.skillsFeedback}</ReactMarkdown></AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="experience">
                    <AccordionTrigger>Experience Feedback</AccordionTrigger>
                    <AccordionContent><ReactMarkdown>{analysisResult.experienceFeedback}</ReactMarkdown></AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="projects">
                    <AccordionTrigger>Project Feedback</AccordionTrigger>
                    <AccordionContent><ReactMarkdown>{analysisResult.projectFeedback}</ReactMarkdown></AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="education">
                    <AccordionTrigger>Education Feedback</AccordionTrigger>
                    <AccordionContent><ReactMarkdown>{analysisResult.educationFeedback}</ReactMarkdown></AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Alert>
                  <Briefcase className="h-4 w-4" />
                  <AlertTitle>Suggested Job Roles</AlertTitle>
                  <AlertDescription><ReactMarkdown>{analysisResult.jobRoleSuggestions}</ReactMarkdown></AlertDescription>
                </Alert>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Overall Suggestions</AlertTitle>
                  <AlertDescription><ReactMarkdown>{formatMarkdownList(analysisResult.overallSuggestions)}</ReactMarkdown></AlertDescription>
                </Alert>
              </div>
            ) : !isLoading && (
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your results will be shown here after analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
