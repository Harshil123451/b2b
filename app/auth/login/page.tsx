/**
 * Login Page
 * Allows users to log in with email and password using Supabase Auth
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's an email confirmation error
        if (error.message.includes('confirm') || error.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in. Check your inbox for a confirmation email.');
        } else {
          throw error;
        }
        return;
      }

      if (data.user && data.session) {
        // Ensure user profile exists
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!userProfile && profileError?.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
          const role = data.user.user_metadata?.role || 'client';
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              name: name,
              role: role,
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            setError('Profile setup failed: ' + insertError.message);
            return;
          }
        } else if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
          setError('Error loading profile: ' + profileError.message);
          return;
        }

        // Check for redirect parameter
        const urlParams = new URLSearchParams(window.location.search);
        const redirectPath = urlParams.get('redirect') || '/dashboard';
        
        // Use window.location for more reliable redirect
        window.location.href = redirectPath;
      } else {
        setError('Login failed: No session created');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

