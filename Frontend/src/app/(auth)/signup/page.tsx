import { SignUpForm } from '@/components/auth/signup-form';
import { AuthCard } from '@/components/auth/auth-card';

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create an Account"
      description="Start your journey with CareerAI Toolkit today."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <SignUpForm />
    </AuthCard>
  );
}
