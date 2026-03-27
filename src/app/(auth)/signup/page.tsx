'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { GitBranch } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to sign up');
      } else {
        setSignupSuccess(true);
        toast.success('Account created! Check your email to verify.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to sign up with GitHub');
        setIsLoading(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
      setIsLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md border-gray-800 bg-gray-900 shadow-xl">
        <div className="p-8">
          <div className="text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <span className="text-2xl text-green-500">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
            <p className="mt-4 text-gray-400">
              We've sent a verification link to <span className="font-semibold">{email}</span>
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Click the link in the email to verify your account and start using APEX-CODE.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-gray-800 bg-gray-900 shadow-xl">
      <div className="p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">APEX-CODE</h1>
          <p className="mt-2 text-sm text-gray-400">Create your account</p>
        </div>

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-200">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-700" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 border-t border-gray-700" />
        </div>

        {/* GitHub OAuth Button */}
        <Button
          onClick={handleGitHubSignup}
          disabled={isLoading}
          variant="outline"
          className="w-full border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
        >
          <GitBranch className="mr-2 h-4 w-4" />
          {isLoading ? 'Signing up...' : 'Sign up with GitHub'}
        </Button>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}