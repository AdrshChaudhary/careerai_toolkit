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
import { Loader2, Sparkles, Github, Code, BookOpen, Lightbulb } from 'lucide-react';
import { RechartsPieChart } from '../recharts-pie-chart';
import { RechartsBarChart } from '../recharts-pie-chart';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

// ★ NEW: Import react-markdown
import ReactMarkdown from 'react-markdown';

const API_BASE_URL = 'http://localhost:8000/api';

const profileSchema = z.object({
  githubUsername: z.string().min(1, 'GitHub username is required.'),
});
const repoSchema = z.object({
  repositoryUrl: z.string().url('Please enter a valid GitHub repository URL.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type RepoFormValues = z.infer<typeof repoSchema>;

interface GithubProfile {
    name: string;
    avatar_url: string;
    public_repos: number;
    followers: number;
    following: number;
}
function formatMarkdownList(text: string) {
  if (!text) return '';
  // Add a newline before each numbered list item if not already present
  return text.replace(/(\d+\.\s+)/g, '\n$1');
}

export function GithubAnalyzerClient() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileResult, setProfileResult] = useState<any | null>(null);
  const [repoResult, setRepoResult] = useState<any | null>(null);
  const [githubProfile, setGithubProfile] = useState<GithubProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isRepoLoading, setIsRepoLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const profileForm = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema) });
  const repoForm = useForm<RepoFormValues>({ resolver: zodResolver(repoSchema) });

  async function fetchGitHubProfile(username: string) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error('User not found or GitHub API limit exceeded.');
        const data = await response.json();
        setGithubProfile(data);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error Fetching Profile',
            description: 'Could not fetch basic data from GitHub. The username may be invalid.',
        });
        setGithubProfile(null);
    }
  }

  async function onProfileSubmit(values: ProfileFormValues) {
    if (!user) return;
    setIsProfileLoading(true);
    setProfileResult(null);
    setGithubProfile(null);

    await fetchGitHubProfile(values.githubUsername);

    try {
        const response = await fetch(`${API_BASE_URL}/github-analyzer/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ githubUsername: values.githubUsername }),
        });
        if (!response.ok) throw new Error('Failed to get analysis.');
        const result = await response.json();
        setProfileResult(result);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'AI Analysis Failed',
            description: 'Could not get AI analysis. Please ensure the backend server is running.',
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
    try {
        const response = await fetch(`${API_BASE_URL}/github-analyzer/repository`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repositoryUrl: values.repositoryUrl }),
        });
        if (!response.ok) throw new Error('Failed to get analysis.');
        const result = await response.json();
        setRepoResult(result);
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'Could not get repository analysis. Please ensure the backend server is running.',
        });
        setRepoResult(null);
    } finally {
        setIsRepoLoading(false);
    }
  }

  const renderResults = (type: 'profile' | 'repo') => {
    if (type === 'profile') {
      if (isProfileLoading) return <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
      if (!profileResult && !githubProfile) return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center"><Github className="h-12 w-12 text-muted-foreground" /><p>Profile analysis results will appear here.</p></div>;
      return (
        <div className="space-y-6">
          {githubProfile && (
            <Card>
              <CardHeader className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={githubProfile.avatar_url} alt={githubProfile.name} />
                  <AvatarFallback>{githubProfile.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 text-2xl">{githubProfile.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 divide-x text-center">
                  <div className="px-2"><p className="text-2xl font-bold">{githubProfile.public_repos}</p><p className="text-sm text-muted-foreground">Repositories</p></div>
                  <div className="px-2"><p className="text-2xl font-bold">{Intl.NumberFormat('en-US', { notation: 'compact' }).format(githubProfile.followers)}</p><p className="text-sm text-muted-foreground">Followers</p></div>
                  <div className="px-2"><p className="text-2xl font-bold">{githubProfile.following}</p><p className="text-sm text-muted-foreground">Following</p></div>
                </div>
              </CardContent>
            </Card>
          )}
          {profileResult && (
            <>
              <Separator />
              <div className="space-y-4">
                <Alert><Code className="h-4 w-4" /><AlertTitle>Tech Stack</AlertTitle><AlertDescription><ReactMarkdown>{profileResult.techStack}</ReactMarkdown></AlertDescription></Alert>
                <Alert><Code className="h-4 w-4" /><AlertTitle>Code Quality Insights</AlertTitle><AlertDescription><ReactMarkdown>{profileResult.codeQualityInsights}</ReactMarkdown></AlertDescription></Alert>
                {profileResult.languageDistribution && (
                  <Card>
                      <CardHeader><CardTitle>Language Distribution</CardTitle></CardHeader>
                      <CardContent>
                          <RechartsPieChart data={profileResult.languageDistribution} />
                      </CardContent>
                  </Card>
                )}
                {profileResult.repositoryCreationActivity && (
                  <Card>
                      <CardHeader><CardTitle>Repository Creation Activity</CardTitle></CardHeader>
                      <CardContent>
                          <RechartsBarChart data={profileResult.repositoryCreationActivity} />
                      </CardContent>
                  </Card>
                )}
                <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>Overall Suggestions</AlertTitle><AlertDescription><ReactMarkdown>{formatMarkdownList(profileResult.overallSuggestions)}</ReactMarkdown></AlertDescription></Alert>
              </div>
            </>
          )}
        </div>
      );
    } else {
      if (isRepoLoading) return <div className="flex justify-center p-8"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
      if (!repoResult) return <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center"><BookOpen className="h-12 w-12 text-muted-foreground" /><p>Repository analysis results will appear here.</p></div>;
      return (
        <div className="space-y-4">
          <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Purpose Feedback</AlertTitle><AlertDescription><ReactMarkdown>{repoResult.purposeFeedback}</ReactMarkdown></AlertDescription></Alert>
          <Alert><BookOpen className="h-4 w-4" /><AlertTitle>Documentation Quality</AlertTitle><AlertDescription><ReactMarkdown>{repoResult.documentationQualityFeedback}</ReactMarkdown></AlertDescription></Alert>
          <Alert><Lightbulb className="h-4 w-4" /><AlertTitle>Overall Suggestions</AlertTitle><AlertDescription><ReactMarkdown>{formatMarkdownList(repoResult.overallSuggestions)}</ReactMarkdown></AlertDescription></Alert>
        </div>
      );
    }
  };

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
                      )} />
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
                      )} />
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
