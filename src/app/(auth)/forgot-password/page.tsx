import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthCard } from '@/components/auth/auth-card';

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
      footerText="Remembered your password?"
      footerLink="/login"
      footerLinkText="Sign In"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
