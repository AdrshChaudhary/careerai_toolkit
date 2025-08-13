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
import * as pdfjsLib from 'pdfjs-dist';
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
    setTimeout(() => {
        setAnalysisResult({
            score: 75,
            comprehensiveAnalysis: "This is a great resume with a strong summary and a good overview of your skills and experience. The formatting is clean and professional. To make it even better, consider quantifying your achievements more in the experience section.",
            summaryFeedback: "The summary is concise and effectively highlights your key qualifications. It could be slightly more tailored to specific roles by including industry-specific keywords.",
            skillsFeedback: "You have a solid list of technical and soft skills. Consider creating sub-categories (e.g., 'Programming Languages', 'Frameworks', 'Developer Tools') to improve readability.",
            experienceFeedback: "Your experience section is well-detailed. Focus on using action verbs and adding metrics to showcase your impact. For example, instead of 'Managed a team,' try 'Managed a team of 5 engineers to deliver a project that increased user engagement by 15%.'",
            educationFeedback: "The education section is clear. No major changes needed.",
            jobRoleSuggestions: "Based on your resume, you would be a strong candidate for roles like: Senior Frontend Developer, UI/UX Engineer, or Full-Stack Developer.",
            overallSuggestions: "Your resume is strong, but tailoring it to each job application by highlighting the most relevant skills and experiences will significantly increase your chances of getting an interview. Good luck!",
        });
        setIsLoading(false);
    }, 2000);
  }

  async function onJobDescriptionSubmit(values: JobDescriptionFormValues) {
    if (!user) return;
    setIsLoading(true);
    setAnalysisResult(null);
    setTimeout(() => {
        setAnalysisResult({
            score: 85,
            comprehensiveAnalysis: null,
            summaryFeedback: "Your summary aligns well with the job description, but could be strengthened by adding the keyword 'SaaS'.",
            skillsFeedback: "You are missing a few key skills mentioned in the job description, such as 'GraphQL' and 'CI/CD'. Consider adding them if you have experience.",
            experienceFeedback: "Your experience is a strong match. To improve your score, rephrase some of your bullet points to more closely mirror the language used in the job requirements.",
            educationFeedback: "Your education background meets the requirements.",
            jobRoleSuggestions: "This role seems like a very good fit for your profile.",
            overallSuggestions: "You are a strong candidate for this role. To stand out, consider writing a compelling cover letter that elaborates on your most relevant projects and expresses your enthusiasm for the company.",
        });
        setIsLoading(false);
    }, 2000);
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

                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Overall Suggestions</AlertTitle>
                    <AlertDescription>{analysisResult.overallSuggestions}</AlertDescription>
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
