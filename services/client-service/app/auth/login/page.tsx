import { LoginForm } from '@/components/forms/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - ResumeParse',
  description: 'Sign in to your ResumeParse account',
};

export default function LoginPage() {
  return (
    <div className="bg-background rounded-xl border border-border p-8 shadow-sm">
      <LoginForm />
    </div>
  );
}
