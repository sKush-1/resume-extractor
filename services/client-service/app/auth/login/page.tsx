import { LoginForm } from '@/components/forms/login-form';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign In - BulkParser.com',
  description: 'Sign in to your BulkParser.com account',
};

export default function LoginPage() {
  return (
    <div className="bg-background rounded-xl border border-border p-8 shadow-sm">
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
