import { LoginForm } from '@/components/auth/login-form';
import { AuthCard } from '@/components/auth/auth-card';

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to access your career toolkit."
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Sign Up"
    >
      <LoginForm />
    </AuthCard>
  );
}
