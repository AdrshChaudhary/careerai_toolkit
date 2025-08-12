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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Set worker path for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
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
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
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
    }
  });

  const extractText = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
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
                resolve(resumeText);
            } catch (error) {
                reject(error);
            }
        }
        reader.onerror = () => {
            reject(new Error('Could not read the resume file.'));
        }
    });
  };

  async function onComprehensiveSubmit(values: ComprehensiveFormValues) {
    if (!user) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const resumeText = await extractText(values.resume[0]);
      const result = await callAnalyzeResume({ resumeText }, user.uid);
      if (result && 'error' in result) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        setAnalysisResult(result);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || "A client-side error occurred." });
    } finally {
      setIsLoading(false);
    }
  }

  async function onJobDescriptionSubmit(values: JobDescriptionFormValues) {
    if (!user) return;
    setIsLoading(true);
    setAnalysisResult(null);
    try {
      const resumeText = await extractText(values.resume[0]);
      const result = await callAnalyzeResume({ resumeText, jobDescription: values.jobDescription }, user.uid);
      if (result && 'error' in result) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      } else {
        setAnalysisResult(result);
      }
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message || "A client-side error occurred." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
     <Tabs defaultValue="comprehensive" onValueChange={setActiveTab} className="w-full">
      <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-1">
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
        </TabsContent>
        <TabsContent value="jobDescription" className="m-0">
          <CardHeader>
            <CardTitle>Job Description Based</CardTitle>
            <CardDescription>Analyze your resume against a specific job description for an ATS score.</CardDescription>
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
                    control={jobDescriptionForm.control}
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
        </TabsContent>
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
                {analysisResult.atsScore > 0 && (
                    <div className="flex justify-center">
                        <ScoreGauge score={analysisResult.atsScore} />
                    </div>
                )}
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
    </Tabs>
  );
}
