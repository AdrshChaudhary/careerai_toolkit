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
    setTimeout(() => {
        setProfileResult({
            techStack: "Primary technologies identified: JavaScript, TypeScript, React, Node.js, and CSS. You show a strong focus on frontend development.",
            codeQualityInsights: "Your recent repositories demonstrate good coding practices, including consistent formatting and use of linters. Consider adding more unit tests to improve code coverage.",
            suggestions: "Your profile is strong. To enhance it further, ensure your pinned repositories are your best work and have clear README files. Contributing to popular open-source projects can also boost your profile's visibility.",
            languageDistributionChart: "pie title Language Distribution\n    \"JavaScript\": 45\n    \"TypeScript\": 30\n    \"HTML/CSS\": 15\n    \"Other\": 10",
            repositoryCreationActivityChart: "gantt\n    title Repository Creation Activity (Last 6 Months)\n    dateFormat  YYYY-MM-DD\n    section Repositories\n    Project-Alpha     :done,    des1, 2024-01-10, 20d\n    Cool-Component    :active,  des2, 2024-02-15, 30d\n    My-Portfolio      :         des3, after des2, 5d\n    Dotfiles          :         des4, after des3, 2d"
        });
        setIsProfileLoading(false);
    }, 2000);
  }

  async function onRepoSubmit(values: RepoFormValues) {
    if (!user) return;
    setIsRepoLoading(true);
    setRepoResult(null);
    setTimeout(() => {
        setRepoResult({
            purposeFeedback: "The repository's purpose is clear from the README, which is excellent. It effectively communicates the project's goals and features.",
            documentationQualityFeedback: "The documentation is well-written and easy to follow. Adding a 'Getting Started' guide with installation and usage examples would be a great improvement.",
            suggestions: "Consider adding a CONTRIBUTING.md file to encourage community contributions. Setting up automated tests with GitHub Actions would also enhance the project's reliability."
        });
        setIsRepoLoading(false);
    }, 2000);
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
    <div className="flex w-full justify-center">
      <div className="flex w-full max-w-2xl flex-col gap-6">
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

    