'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Linkedin, Github, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const tools = [
  {
    title: 'Resume Analyzer',
    description: 'Get an ATS score and feedback to improve your resume against a job description.',
    icon: FileText,
    link: '/dashboard/resume-analyzer',
  },
  {
    title: 'LinkedIn Optimizer',
    description: 'Enhance your LinkedIn profile with AI-powered suggestions for better visibility.',
    icon: Linkedin,
    link: '/dashboard/linkedin-optimizer',
  },
  {
    title: 'GitHub Analyzer',
    description: 'Analyze your GitHub profile or a repository to showcase your technical skills.',
    icon: Github,
    link: '/dashboard/github-analyzer',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'User';

  return (
    <div className="flex flex-col gap-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Leverage AI to supercharge your career. Start by selecting a tool below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Card key={tool.title} className="flex flex-col transition-all hover:shadow-lg hover:shadow-primary/20">
            <CardHeader className="flex flex-row items-center gap-4">
              <tool.icon className="h-10 w-10 text-primary" />
              <div>
                <CardTitle>{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{tool.description}</CardDescription>
            </CardContent>
            <div className="p-6 pt-0">
               <Button asChild className="w-full">
                <Link href={tool.link}>
                  Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
