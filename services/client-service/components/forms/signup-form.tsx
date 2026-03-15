'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/auth-context';

type Step = 'signup' | 'verify';

export function SignupForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [errors, setErrors] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const google = (window as any).google;
    if (google && document.getElementById('google-signup-btn')) {
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
              toast.success('Signed up with Google!');
            } catch (err: any) {
              toast.error(err.message || 'Google login failed');
            } finally {
              setIsLoading(false);
            }
          },
        });
        google.accounts.id.renderButton(
          document.getElementById('google-signup-btn'),
          { theme: 'outline', size: 'large', width: '300' }
        );
      }
    }
  }, [step]); // Re-render button if we go back from verify step

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value });
    if (formData.confirmPassword && value !== formData.confirmPassword) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setFormData({ ...formData, confirmPassword: value });
    if (formData.password && value !== formData.password) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch) return;

    setIsLoading(true);
    setErrors(null);

    try {
      await fetchApi('/auth/send-email-verification-request', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email }),
      });

      setStep('verify');
    } catch (err: any) {
      setErrors(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setErrors(null);

    try {
      // 1. Verify OTP
      await fetchApi('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email, otp }),
      });

      // 2. Register User
      const { name, email, password } = formData;
      await fetchApi('/user/email-registeration', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      // Refresh global auth state
      await refreshUser();

      router.push('/dashboard');
    } catch (err: any) {
      setErrors(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setStep('signup')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to signup
        </button>

        <div>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We've sent a 6-digit verification code to{' '}
            <span className="font-medium text-foreground">{formData.email}</span>
          </p>
        </div>

        {errors && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{errors}</span>
          </div>
        )}

        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={4} className="w-12 h-12 text-lg border-2" />
                <InputOTPSlot index={5} className="w-12 h-12 text-lg border-2" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline font-medium"
              onClick={handleSignupSubmit}
              disabled={isLoading}
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignupSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join thousands of recruiters using ResumeParse
        </p>
      </div>

      {errors && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{errors}</span>
        </div>
      )}

      <div id="google-signup-btn" className="w-full flex justify-center"></div>

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
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Smith"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            required
            className={!passwordMatch ? 'border-destructive' : ''}
          />
          {!passwordMatch && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Passwords do not match</span>
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={isLoading || !passwordMatch}
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
