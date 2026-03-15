import { SignupForm } from '@/components/forms/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account - ResumeParse',
  description: 'Create a new ResumeParse account',
};

export default function SignupPage() {
  return (
    <div className="bg-background rounded-xl border border-border p-8 shadow-sm">
      <SignupForm />
    </div>
  );
}
