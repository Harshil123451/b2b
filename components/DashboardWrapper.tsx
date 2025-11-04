/**
 * Dashboard Wrapper Component
 * Client-side wrapper that handles authentication and loads the appropriate dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ClientDashboard from './ClientDashboard';
import ProviderDashboard from './ProviderDashboard';

export default function DashboardWrapper() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string; role: 'client' | 'provider' } | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      // Check for session - strict authentication check
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // If no session or session error, immediately redirect
      if (!session || sessionError) {
        router.replace('/auth/login?redirect=/dashboard');
        return;
      }

      // Double-check by getting the user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!user || userError) {
        router.replace('/auth/login?redirect=/dashboard');
        return;
      }

      // Get user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single();

      if (error || !profile) {
        // Try to create profile if it doesn't exist
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
        const role = (session.user.user_metadata?.role as 'client' | 'provider') || 'client';

        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            name: name,
            role: role,
          })
          .select('role, name')
          .single();

        if (createError || !newProfile) {
          console.error('Error creating profile:', createError);
          router.push('/auth/login');
          return;
        }

        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If no user profile after loading, redirect to login
  if (!userProfile) {
    // This should not happen as we redirect earlier, but as a safety measure
    router.replace('/auth/login?redirect=/dashboard');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (userProfile.role === 'client') {
    return <ClientDashboard userName={userProfile.name} />;
  } else if (userProfile.role === 'provider') {
    return <ProviderDashboard userName={userProfile.name} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Invalid user role</p>
    </div>
  );
}

