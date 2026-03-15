'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);

    try {
      await fetchApi('/user/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Refresh the global auth state now that candles are set
      await refreshUser();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setErrors(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const google = (window as any).google;
    if (!google) {
      toast.error('Google login is loading, please try again in a moment.');
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Client ID not configured.');
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        setIsLoading(true);
        try {
          await fetchApi('/user/google-login', {
            method: 'POST',
            body: JSON.stringify({ token: response.credential }),
          });
          await refreshUser();
          router.push('/dashboard');
          toast.success('Logged in with Google!');
        } catch (err: any) {
          toast.error(err.message || 'Google login failed');
        } finally {
          setIsLoading(false);
        }
      },
    });

    google.accounts.id.prompt(); // Show one tap
    google.accounts.id.renderButton(
      document.getElementById('google-login-btn'),
      { theme: 'outline', size: 'large', width: '100%' }
    );
  };

  useEffect(() => {
    const google = (window as any).google;
    if (google && document.getElementById('google-login-btn')) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setIsLoading(true);
            try {
              await fetchApi('/user/google-login', {
                method: 'POST',
                body: JSON.stringify({ token: response.credential }),
              });
              await refreshUser();
              router.push('/dashboard');
              toast.success('Logged in with Google!');
            } catch (err: any) {
              toast.error(err.message || 'Google login failed');
            } finally {
              setIsLoading(false);
            }
          },
        });
        google.accounts.id.renderButton(
          document.getElementById('google-login-btn'),
          { theme: 'outline', size: 'large', width: '300' }
        );
      }
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your ResumeParse account
        </p>
      </div>

      {
        errors && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{errors}</span>
          </div>
        )
      }

      <div id="google-login-btn" className="w-full flex justify-center"></div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:underline font-medium">
          Create one
        </Link>
      </p>
    </form >
  );
}
