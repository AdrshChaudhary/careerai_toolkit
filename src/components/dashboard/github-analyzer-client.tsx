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
import { Loader2, Sparkles, Github, Code, BookOpen, Users, GitFork, Lightbulb } from 'lucide-react';
import { MermaidChart } from '../mermaid-chart';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

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

    try {
      const response = await fetch(`https://api.github.com/users/${values.githubUsername}`);
      if (!response.ok) {
        throw new Error('User not found or API limit exceeded.');
      }
      const data = await response.json();

      // We set the real data for basic profile info
      // and keep the mock data for AI-based analysis for now.
      setProfileResult({
          name: data.name || data.login,
          avatarUrl: data.avatar_url,
          repoCount: data.public_repos,
          followers: data.followers,
          following: data.following,
          techStack: "Primary technologies identified: C, Assembly, and Shell scripting. You have a deep focus on systems-level programming and operating systems.",
          codeQualityInsights: "Code is exceptionally well-structured and follows strict coding standards, which is expected for kernel development. There is a strong emphasis on performance and stability.",
          overallSuggestions: "Your profile is legendary. For others looking to build a similar profile, focus on contributing to large-scale, impactful open-source projects. Clear and concise commit messages are key.",
          languageDistributionChart: "pie title Language Distribution\n    \"C\": 85\n    \"Assembly\": 10\n    \"Shell\": 5",
          repositoryCreationActivityChart: "gantt\n    title Repository Creation Activity\n    dateFormat  YYYY-MM-DD\n    section Core Projects\n    Linux Kernel     :done,    des1, 1991-08-25, 12000d\n    Subsurface       :active,  des2, 2011-10-01, 4000d"
      });

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error Fetching Profile',
            description: 'Could not fetch the GitHub profile. Please check the username and try again.',
        });
        setProfileResult(null);
    } finally {
        setIsProfileLoading(false);
    }
  }

  async function onRepoSubmit(values: RepoFormValues) {
    if (!user) return;
    setIsRepoLoading(true);
    setRepoResult(null);
    // This part will be implemented with Genkit later.
    setTimeout(() => {
        setRepoResult({
            purposeFeedback: "The repository's purpose is crystal clear from the README and project documentation. It effectively communicates the project's massive scope and goals.",
            documentationQualityFeedback: "The documentation is extensive, well-maintained, and serves as a benchmark for large open-source projects. It includes guides for contributors, users, and developers.",
            overallSuggestions: "This repository is a model for open-source projects. To maintain this standard, continue to enforce strict contribution guidelines and keep documentation up-to-date with the latest changes."
        });
        setIsRepoLoading(false);
    }, 2000);
  }
  
  const renderResults = (type: 'profile' | 'repo') => {
      if (type === 'profile') {
        if(isProfileLoading) return <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        if(!profileResult) return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center"><Github className="h-12 w-12 text-muted-foreground" /><p>Profile analysis results will appear here.</p></div>
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 border-4 border-primary/20">
                            <AvatarImage src={profileResult.avatarUrl} alt={profileResult.name} />
                            <AvatarFallback>{profileResult.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="mt-4 text-2xl">{profileResult.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 divide-x text-center">
                            <div className="px-2">
                                <p className="text-2xl font-bold">{profileResult.repoCount}</p>
                                <p className="text-sm text-muted-foreground">Repositories</p>
                            </div>
                            <div className="px-2">
                                <p className="text-2xl font-bold">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(profileResult.followers)}</p>
                                <p className="text-sm text-muted-foreground">Followers</p>
                            </div>
                            <div className="px-2">
                                <p className="text-2xl font-bold">{profileResult.following}</p>
                                <p className="text-sm text-muted-foreground">Following</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Separator />
                <div className="space-y-4">
                  <Alert><Code className="h-4 w-4" /><AlertTitle>Tech Stack</AlertTitle><AlertDescription>{profileResult.techStack}</AlertDescription></Alert>
                  <Alert><Code className="h-4 w-4" /><AlertTitle>Code Quality Insights</AlertTitle><AlertDescription>{profileResult.codeQualityInsights}</AlertDescription></Alert>
                  {profileResult.languageDistributionChart && <Card><CardHeader><CardTitle>Language Distribution</CardTitle></CardHeader><CardContent><MermaidChart chart={profileResult.languageDistributionChart} /></CardContent></Card>}
                  {profileResult.repositoryCreationActivityChart && <Card><CardHeader><CardTitle>Repo Creation Activity</CardTitle></CardHeader><CardContent><MermaidChart chart={profileResult.repositoryCreationActivityChart} /></CardContent></Card>}
                  <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>Overall Suggestions</AlertTitle><AlertDescription>{profileResult.overallSuggestions}</AlertDescription></Alert>
                </div>
            </div>
        )
      } else {
        if(isRepoLoading) return <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
        if(!repoResult) return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center"><BookOpen className="h-12 w-12 text-muted-foreground" /><p>Repository analysis results will appear here.</p></div>
        return (
            <div className="space-y-4">
                <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Purpose Feedback</AlertTitle><AlertDescription>{repoResult.purposeFeedback}</AlertDescription></Alert>
                <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Documentation Quality</AlertTitle><AlertDescription>{repoResult.documentationQualityFeedback}</AlertDescription></Alert>
                <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>Overall Suggestions</AlertTitle><AlertDescription>{repoResult.overallSuggestions}</AlertDescription></Alert>
            </div>
        )
      }
  }


  return (
    <div className="flex w-full justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <Tabs defaultValue="profile" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Analyzer</TabsTrigger>
            <TabsTrigger value="repository">Repository Analyzer</TabsTrigger>
        </TabsList>
        <div className="mt-6 flex flex-col gap-6">
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
                            <FormControl><Input placeholder="https://github.com/torvalds/linux" {...field} /></FormControl>
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
            </div>
        </Tabs>
        <Card>
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
    </div>
  );
}
