import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { KofiWidget } from '@/components/kofi-widget';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'CareerAI Toolkit',
  description: 'AI-powered tools for your career development.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased dark', inter.variable)}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <KofiWidget />
      </body>
    </html>
  );
}
