'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnalyzeResumeOutput } from '@/ai/flows/analyze-resume';
import { useAuth } from '@/contexts/auth-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileText, Briefcase, Bot } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScoreGauge } from './score-gauge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import * as pdfjsLib from 'pdfjs-dist';
import { callAnalyzeResume } from '@/app/dashboard/resume-analyzer/actions';

// Set worker path for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const formSchema = z.object({
  resume: z.any().refine((files) => files?.length == 1, 'Resume PDF is required.'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export function ResumeAnalyzerClient() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
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
      const file = values.resume[0];
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) {
            throw new Error("Failed to read file.");
          }
          const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
          const loadingTask = pdfjsLib.getDocument(typedArray);
          const pdf = await loadingTask.promise;
          
          let resumeText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            textContent.items.forEach((item) => {
                if ('str' in item) {
                    resumeText += item.str + ' ';
                }
            });
            resumeText += '\n';
          }

          if (resumeText.trim().length === 0) {
              throw new Error("Could not extract text from PDF. Please ensure it's a text-based PDF.");
          }

          const result = await callAnalyzeResume(
            { resumeText, jobDescription: values.jobDescription },
            user.uid
          );
          setAnalysisResult(result);
        } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error Analyzing Resume', description: error.message || 'Could not process PDF file.' });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Error Reading File', description: 'Could not read the resume file.' });
        setIsLoading(false);
      }

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Resume Analyzer</CardTitle>
          <CardDescription>Upload your resume and paste a job description to get an AI-powered analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="resume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume PDF</FormLabel>
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
              <FormField
                control={form.control}
                name="jobDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste the full job description here..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Resume
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
              <div className="flex justify-center">
                 <ScoreGauge score={analysisResult.atsScore} />
              </div>
               {analysisResult.comprehensiveAnalysis && (
                <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle>Comprehensive Analysis</AlertTitle>
                    <AlertDescription>{analysisResult.comprehensiveAnalysis}</AlertDescription>
                </Alert>
               )}
              <Accordion type="single" collapsible defaultValue="summary" className="w-full">
                <AccordionItem value="summary">
                  <AccordionTrigger>Summary Feedback</AccordionTrigger>
                  <AccordionContent>{analysisResult.summaryFeedback}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="skills">
                  <AccordionTrigger>Skills Feedback</AccordionTrigger>
                  <AccordionContent>{analysisResult.skillsFeedback}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="experience">
                  <AccordionTrigger>Experience Feedback</AccordionTrigger>
                  <AccordionContent>{analysisResult.experienceFeedback}</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="education">
                  <AccordionTrigger>Education Feedback</AccordionTrigger>
                  <AccordionContent>{analysisResult.educationFeedback}</AccordionContent>
                </AccordionItem>
              </Accordion>
              
               <Alert>
                  <Briefcase className="h-4 w-4" />
                  <AlertTitle>Suggested Job Roles</AlertTitle>
                  <AlertDescription>{analysisResult.jobRoleSuggestions}</AlertDescription>
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
  );
}
