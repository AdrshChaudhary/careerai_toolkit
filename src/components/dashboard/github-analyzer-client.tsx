'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Github, Code, BookOpen } from 'lucide-react';
import { MermaidChart } from '../mermaid-chart';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

// Schemas
const profileSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required.'),
});
const repoSchema = z.object({
  repositoryUrl: z.string().url('Please enter a valid GitHub repository URL.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type RepoFormValues = z.infer<typeof repoSchema>;

export function GithubAnalyzerClient() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileResult, setProfileResult] = useState<any | null>(null);
  const [repoResult, setRepoResult] = useState<any | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const profileForm = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });
  const repoForm = useForm<RepoFormValues>({ resolver: zodResolver(repoSchema) });

  async function onProfileSubmit(values: ProfileFormValues) {
    if (!user) return;
    setIsProfileLoading(true);
    setProfileResult(null);
    toast({
        title: "Backend Not Implemented",
        description: "The backend for this feature has been removed.",
        variant: "destructive"
    })
    setIsProfileLoading(false);
  }

  async function onRepoSubmit(values: RepoFormValues) {
    if (!user) return;
    setIsRepoLoading(true);
    setRepoResult(null);
     toast({
        title: "Backend Not Implemented",
        description: "The backend for this feature has been removed.",
        variant: "destructive"
    })
    setIsRepoLoading(false);
  }
  
  const renderResults = (type: 'profile' | 'repo') => {
      if (type === 'profile') {
        if(isProfileLoading) return <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        if(!profileResult) return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center"><Github className="h-12 w-12 text-muted-foreground" /><p>Profile analysis results will appear here.</p></div>
        return (
            <div className="space-y-4">
                <Alert><Code className="h-4 w-4" /><AlertTitle>Tech Stack</AlertTitle><AlertDescription>{profileResult.techStack}</AlertDescription></Alert>
                <Alert><Code className="h-4 w-4" /><AlertTitle>Code Quality Insights</AlertTitle><AlertDescription>{profileResult.codeQualityInsights}</AlertDescription></Alert>
                <Alert><Code className="h-4 w-4" /><AlertTitle>Suggestions</AlertTitle><AlertDescription>{profileResult.suggestions}</AlertDescription></Alert>
                {profileResult.languageDistributionChart && <Card><CardHeader><CardTitle>Language Distribution</CardTitle></CardHeader><CardContent><MermaidChart chart={profileResult.languageDistributionChart} /></CardContent></Card>}
                {profileResult.repositoryCreationActivityChart && <Card><CardHeader><CardTitle>Repo Creation Activity</CardTitle></CardHeader><CardContent><MermaidChart chart={profileResult.repositoryCreationActivityChart} /></CardContent></Card>}
            </div>
        )
      } else {
        if(isRepoLoading) return <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        if(!repoResult) return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center"><BookOpen className="h-12 w-12 text-muted-foreground" /><p>Repository analysis results will appear here.</p></div>
        return (
            <div className="space-y-4">
                <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Purpose Feedback</AlertTitle><AlertDescription>{repoResult.purposeFeedback}</AlertDescription></Alert>
                <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Documentation Quality</AlertTitle><AlertDescription>{repoResult.documentationQualityFeedback}</AlertDescription></Alert>
                <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Suggestions</AlertTitle><AlertDescription>{repoResult.suggestions}</AlertDescription></Alert>
            </div>
        )
      }
  }


  return (
    <Tabs defaultValue="profile" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="profile">Profile Analyzer</TabsTrigger>
        <TabsTrigger value="repository">Repository Analyzer</TabsTrigger>
      </TabsList>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <TabsContent value="profile" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>Profile Analyzer</CardTitle>
              <CardDescription>Enter a GitHub username to analyze their profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <FormField control={profileForm.control} name="githubUsername" render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Username</FormLabel>
                        <FormControl><Input placeholder="e.g., torvalds" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isProfileLoading} className="w-full">
                    {isProfileLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Analyze Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="repository" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle>Repository Analyzer</CardTitle>
              <CardDescription>Enter a public GitHub repository URL for analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...repoForm}>
                <form onSubmit={repoForm.handleSubmit(onRepoSubmit)} className="space-y-4">
                  <FormField control={repoForm.control} name="repositoryUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Repository URL</FormLabel>
                        <FormControl><Input placeholder="https://github.com/facebook/react" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isRepoLoading} className="w-full">
                    {isRepoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Analyze Repository
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
         <Card className="md:col-start-2 md:row-start-1">
            <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                    {activeTab === 'profile' ? 'Profile insights will appear here.' : 'Repository insights will appear here.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
               {renderResults(activeTab as 'profile' | 'repo')}
            </CardContent>
        </Card>
      </div>
    </Tabs>
  );
}
