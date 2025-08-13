import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import Script from 'next/script';

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
        <Script src='https://storage.ko-fi.com/cdn/scripts/overlay-widget.js' strategy="lazyOnload" />
        <Script id="kofi-widget-config" strategy="lazyOnload">
          {`
            kofiWidgetOverlay.draw('aadarshchaudhary', {
              'type': 'floating-chat',
              'floating-chat.donateButton.text': 'Support me',
              'floating-chat.donateButton.background-color': '#794bc4',
              'floating-chat.donateButton.text-color': '#fff'
            });
          `}
        </Script>
      </body>
    </html>
  );
}
