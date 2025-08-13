'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';
import { Icons } from '@/components/icons';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FileText, Linkedin, Github, Loader2, MailCheck, AlertCircle, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, reloadUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
           <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
             <CardTitle className="mt-4 text-2xl font-bold tracking-tight">Verify Your Email</CardTitle>
             <CardDescription>
              We've sent a verification link to <strong>{user.email}</strong>. Please check your inbox and follow the instructions to continue.
             </CardDescription>
           </CardHeader>
           <CardContent className="flex flex-col gap-4">
              <div className="rounded-md border border-yellow-500/50 bg-yellow-500/10 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-300">Can't find the email?</h3>
                    <div className="mt-2 text-sm text-yellow-200">
                      <p>Please check your spam or junk folder. The email will be from a `firebaseapp.com` address.</p>
                    </div>
                  </div>
                </div>
              </div>
             <Button onClick={async () => await reloadUser()}>I've verified my email</Button>
             <Button variant="outline" onClick={signOut}>Sign Out & Return to Login</Button>
           </CardContent>
         </Card>
      </main>
    )
  }

  const menuItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/dashboard/resume-analyzer', icon: FileText, label: 'Resume Analyzer' },
    { href: '/dashboard/linkedin-optimizer', icon: Linkedin, label: 'LinkedIn Optimizer' },
    { href: '/dashboard/github-analyzer', icon: Github, label: 'GitHub Analyzer' },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-9 shrink-0" asChild>
              <Link href="/dashboard">
                <Icons.logo className="size-6 text-primary" />
              </Link>
            </Button>
            <div className="flex-1 overflow-hidden">
              <h2 className="truncate text-lg font-semibold">CareerAI Toolkit</h2>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
                 <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip={{ children: 'Dashboard', side: 'right' }}>
                    <Link href="/dashboard"><LayoutGrid/><span>Dashboard</span></Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarGroup>
                <SidebarGroupLabel>Tools</SidebarGroupLabel>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/resume-analyzer')} tooltip={{ children: 'Resume Analyzer', side: 'right' }}>
                            <Link href="/dashboard/resume-analyzer"><FileText/><span>Resume Analyzer</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/linkedin-optimizer')} tooltip={{ children: 'LinkedIn Optimizer', side: 'right' }}>
                            <Link href="/dashboard/linkedin-optimizer"><Linkedin/><span>LinkedIn Optimizer</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                         <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/github-analyzer')} tooltip={{ children: 'GitHub Analyzer', side: 'right' }}>
                            <Link href="/dashboard/github-analyzer"><Github/><span>GitHub Analyzer</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
             </SidebarGroup>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserNav user={user} signOut={signOut} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
           <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-lg font-semibold sm:text-xl">
              {menuItems.find((item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)))?.label || 'Dashboard'}
            </h1>
          </div>
          <div>
            <UserNav user={user} signOut={signOut} isInHeader={true} />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
