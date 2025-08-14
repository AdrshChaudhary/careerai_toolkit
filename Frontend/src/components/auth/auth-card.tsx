import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthCard({ children, title, description, footerText, footerLink, footerLinkText }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <Icons.logo className="h-12 w-12" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-primary">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-muted-foreground">
          {footerText}{' '}
          <Link href={footerLink} className="font-medium text-primary hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
