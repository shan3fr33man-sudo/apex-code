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

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || 'Failed to sign in');
      } else {
        toast.success('Signed in successfully');
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(error.message || 'Failed to sign in with GitHub');
        setIsLoading(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-gray-800 bg-gray-900 shadow-xl">
      <div className="p-8">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">APEX-CODE</h1>
          <p className="mt-2 text-sm text-gray-400">Welcome back</p>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="Enter your password"
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
            {isLoading ? 'Signing in...' : 'Sign in with Email'}
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
          onClick={handleGitHubLogin}
          disabled={isLoading}
          variant="outline"
          className="w-full border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
        >
          <GitBranch className="mr-2 h-4 w-4" />
          {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
        </Button>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="text-blue-500 hover:text-blue-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </Card>
  );
}