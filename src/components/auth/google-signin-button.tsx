'use client';

import { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Failed to sign in with Google. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" type="button" disabled={loading} onClick={handleSignIn} className="w-full">
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      Google
    </Button>
  );
}
