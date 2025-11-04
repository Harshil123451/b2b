/**
 * Sign Up Page
 * Allows new users to create an account with email and password
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'provider'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign up with Supabase Auth
      // Role is passed in metadata and will be handled by the database trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Wait a bit for the trigger to create the user profile
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Ensure user profile exists (fallback if trigger didn't run)
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        if (!existingProfile) {
          // Create profile manually if trigger didn't work
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              name: name,
              role: role,
            });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        // Check if email confirmation is required
        if (authData.session) {
          // User is automatically logged in
          router.push('/dashboard');
          router.refresh();
        } else {
          // Email confirmation required
          setError('');
          alert('Please check your email to confirm your account before logging in.');
          router.push('/auth/login');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Get started
          </h1>
          <p className="text-gray-600">
            Create your account and start comparing prices
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'client'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === 'client'}
                  onChange={(e) => setRole(e.target.value as 'client' | 'provider')}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Client</div>
                  <div className="text-sm text-gray-600">
                    I want to post service requests and receive offers
                  </div>
                </div>
              </label>
              <label
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'provider'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="provider"
                  checked={role === 'provider'}
                  onChange={(e) => setRole(e.target.value as 'client' | 'provider')}
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Provider</div>
                  <div className="text-sm text-gray-600">
                    I want to submit offers for service requests
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

