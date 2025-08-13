import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { ArrowRight, FileText, Linkedin, Github } from 'lucide-react';

const features = [
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

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold sm:inline-block">
                CareerAI Toolkit
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center">
              <Button variant="outline" asChild className="hover:bg-primary/10 hover:text-primary">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Supercharge Your Career with AI
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Get personalized feedback on your resume, optimize your LinkedIn profile, and showcase your technical skills with our suite of AI-powered tools.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Our toolkit provides everything you need to stand out in the job market.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-primary/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <feature.icon className="h-10 w-10 text-primary" />
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Learn More</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by You. Powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
