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
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/user-nav';
import { Icons } from '@/components/icons';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FileText, Linkedin, Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
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

  const menuItems = [
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
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserNav user={user} signOut={signOut} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold sm:text-xl">
              {menuItems.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
