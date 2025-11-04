/**
 * Home Page
 * Landing page with navigation to login/signup
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import StatsSection from '@/components/StatsSection';
import FeaturesSection from '@/components/FeaturesSection';
import Testimonials from '@/components/Testimonials';
import HomeNavigation from '@/components/HomeNavigation';

export default async function Home() {
  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <HomeNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simplest way to compare{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              B2B prices
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Connect clients with providers for the best service offers. Track requests, compare offers, and make better decisions.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200"
            >
              Login
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required • 14-day free trial</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Post Requests</h3>
            <p className="text-gray-600">Clients can easily post service requests with detailed requirements</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Offers</h3>
            <p className="text-gray-600">Providers submit competitive offers with pricing and delivery details</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Compare & Decide</h3>
            <p className="text-gray-600">Compare all offers side-by-side with advanced filtering and sorting</p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to optimize your procurement process?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of businesses making smarter purchasing decisions
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-all text-lg"
            >
              Login
            </Link>
          </div>
          <p className="mt-6 text-gray-400">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}

